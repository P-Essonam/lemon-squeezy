"use server"

import { currentUser } from "@/lib/auth";
import { db } from "@/lib/db";
import { configureLemonSqueezy } from "@/lib/lemonsqueezy";
import { webhookHasData, webhookHasMeta } from "@/lib/typeguards";
import { Variant, cancelSubscription, createCheckout, getPrice, getProduct, getSubscription, listPrices, listProducts, updateSubscription } from "@lemonsqueezy/lemonsqueezy.js";
import { Plan, Subscription, webhookEvent } from "@prisma/client";
import { v4 } from "uuid";



export async function syncPlans() {

    configureLemonSqueezy()

    const productVariants: Plan[] = await db.plan.findMany()

    const products = await listProducts({
        filter: { storeId: process.env.LEMONSQUEEZY_STORE_ID },
        include: ['variants'],
    });

    const allVariants = products.data?.included as Variant['data'][] | undefined;

    async function _addVariant(variant: Plan) {
  
  
        try {
          await db.plan.upsert({
            where: { variantId: variant.variantId },
            create: variant,
            update: {
              name: variant.name,
              description: variant.description,
              price: variant.price,
              interval: variant.interval,
              intervalCount: variant.intervalCount,
              isUsageBased: variant.isUsageBased,
              productId: variant.productId,
              productName: variant.productName,
              trialInterval: variant.trialInterval,
              trialIntervalCount: variant.trialIntervalCount,
              sort: variant.sort,
              variantId: variant.variantId,
            },
          });
    
      
        } catch (error) {
          console.error('Error syncing variant:', error);
        }
    
        productVariants.push(variant);
    }

    if(allVariants) {
        for (const v of allVariants){
            const variant = v.attributes

            const productName = (await getProduct(variant.product_id)).data?.data.attributes.name ?? '';
            const description = (await getProduct(variant.product_id)).data?.data.attributes.description ?? '';

            const variantPriceObject = await listPrices({
                filter: {
                    variantId: v.id,
                },
            });

            const currentPriceObj = variantPriceObject.data?.data[0];
            const isUsageBased =
              currentPriceObj?.attributes.usage_aggregation !== null;
            const interval = currentPriceObj?.attributes.renewal_interval_unit;
            const intervalCount =
              currentPriceObj?.attributes.renewal_interval_quantity;
            const trialInterval = currentPriceObj?.attributes.trial_interval_unit;
            const trialIntervalCount =
              currentPriceObj?.attributes.trial_interval_quantity;
      
            const price = isUsageBased
              ? currentPriceObj?.attributes.unit_price_decimal
              : currentPriceObj.attributes.unit_price;
      
            const priceString = price !== null ? price?.toString() ?? '' : '';
      
            const isSubscription =
              currentPriceObj?.attributes.category === 'subscription';

        

            if (!isSubscription) {
                continue;
            }

            await _addVariant({
                id: v4(),
                name: variant.name,
                description: description,
                price: priceString,
                interval: interval ?? null,
                intervalCount: intervalCount ?? null,
                isUsageBased,
                productId: variant.product_id,
                productName,
                variantId: parseInt(v.id),
                trialInterval: trialInterval ?? null,
                trialIntervalCount: trialIntervalCount ?? null,
                sort: variant.sort,
            });

        }
    }


    return productVariants

}


export const getSubscruptionPlans = async () => {
    try {
        const user = await currentUser()
        if(!user) throw new Error('User not found')

        const plans = await db.plan.findMany()

        return plans
    } catch (error) {
        console.log("Error getting subscription plans: ", error)
        throw new Error('Error getting subscription plans')
    }
}


export const getCurrentUser = async () => {

  const authUSer = await currentUser()
    
  if (!authUSer) {
    throw new Error("User is not authenticated.");
  }
  const user = await db.user.findUnique({
      where: {
          id: authUSer.id
      }
  });

  return user
}


export async function getCheckoutURL(variantId: number) {
  configureLemonSqueezy();


  const user = await getCurrentUser()
  if (!user) throw new Error("Error getting user data")

  const checkout = await createCheckout(
    process.env.LEMONSQUEEZY_STORE_ID!,
    variantId,
    {
      checkoutOptions: {
        media: false,
        logo: true,
        dark: true,
        subscriptionPreview: true,
      },
      checkoutData: {
        email: user.email,
        custom: {
          user_id: user.id,
        },
      },
      productOptions: {
        enabledVariants: [variantId],
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/billing`,
        receiptButtonText: "Go to Billing",
        receiptThankYouNote: "Thank you for signing up to Lemon Stand!",
      },
    },
  );

  return checkout.data?.data.attributes.url;
}


export async function getUserSubscriptions() {

  try {
    const user = await getCurrentUser();
    if (!user) throw new Error("Error getting user data")
    const userSubscriptions = await db.subscription.findMany({
      where: {
        userId: user.id,
      },
      include: {
        plan: true,
      },
    });

    return userSubscriptions;
  } catch (error) {
    return [];
  }
}


export async function changePlan(currentPlanId: string, newPlanId: string) {
  configureLemonSqueezy();


  const userSubscriptions = await getUserSubscriptions();


  const subscription = userSubscriptions.find(
    (sub) => sub.plan.id === currentPlanId,
  );

  if (!subscription) {
    throw new Error(
      `Aucun abonnement avec l'identifiant de plan #${currentPlanId} n'a été trouvé.`,
    );
  }


  const newPlan = await db.plan.findUnique({
    where: { id: newPlanId },
  });

  // Envoyez une demande à Lemon Squeezy pour changer l'abonnement.
  const updatedSub = await updateSubscription(subscription.lemonSqueezyId, {
    variantId: newPlan?.variantId,
  });


  try {
    await db.subscription.update({
      where: { lemonSqueezyId: subscription.lemonSqueezyId },
      data: {
        planId: newPlanId,
        price: newPlan?.price,
        endsAt: updatedSub.data?.data.attributes.ends_at,
      },
    });
  } catch (error) {
    console.log('🔴Error updating subscription in database | changePlan', error)
    throw new Error(
      `Échec de la mise à jour de l'abonnement #${subscription.lemonSqueezyId} dans la base de données.`,
    );
  }


  return updatedSub;
}



export async function processWebhookEvent(webhookEvent: webhookEvent) {
  try {
    await db.$connect();

    const dbWebhookEvent = await db.webhookEvent.findUnique({
      where: { id: webhookEvent.id },
    });

    if (!dbWebhookEvent) {
      throw new Error(`Webhook event #${webhookEvent.id} not found in the database.`);
    }

    if (!process.env.WEBHOOK_URL) {
      throw new Error("Missing required WEBHOOK_URL env variable. Please, set it in your .env file.");
    }

    let processingError = "";
    const eventBody = webhookEvent.body;

    if (!webhookHasMeta(eventBody)) {
      processingError = "Event body is missing the 'meta' property.";
    } else if (webhookHasData(eventBody)) {
      if (webhookEvent.eventName.startsWith("subscription_payment_")) {
        // Enregistrer les factures d'abonnement ; eventBody est une SubscriptionInvoice
        // Pas encore implémenté.
      } else if (webhookEvent.eventName.startsWith("subscription_")) {
        // Enregistrer les événements d'abonnement ; eventBody est une Subscription
        const attributes = eventBody.data.attributes;
        const variantId = attributes.variant_id as string;

        const user = await db.user.findUnique({
          where: { 
              id: eventBody.meta.custom_data.user_id
          },
        });

        if (!user) throw new Error("Error getting user data")


        // Nous supposons que la table Plan est à jour.
        const plan = await db.plan.findUnique({
          where: { variantId: parseInt(variantId, 10) },
        });

        if (!plan) {
          processingError = `Plan with variantId ${variantId} not found.`;
        } else {
          // Mettre à jour l'abonnement dans la base de données.

          const priceId = attributes.first_subscription_item.price_id;

          // Obtenir les données de prix depuis Lemon Squeezy.
          const priceData = await getPrice(priceId);
          if (priceData.error) {
            processingError = `Failed to get the price data for the subscription ${eventBody.data.id}.`;
          }

          const isUsageBased = attributes.first_subscription_item.is_usage_based;
          const price = isUsageBased
            ? priceData.data?.data.attributes.unit_price_decimal
            : priceData.data?.data.attributes.unit_price;


          const updateData: Subscription = {
            id: v4(),
            lemonSqueezyId: eventBody.data.id,
            orderId: attributes.order_id as number,
            name: attributes.user_name as string,
            email: attributes.user_email as string,
            status: attributes.status as string,
            statusFormatted: attributes.status_formatted as string,
            renewsAt: attributes.renews_at as string,
            endsAt: attributes.ends_at as string,
            trialEndsAt: attributes.trial_ends_at as string,
            price: price?.toString() ?? "",
            isPaused: false,
            subscriptionItemId: attributes.first_subscription_item.id,
            isUsageBased: attributes.first_subscription_item.is_usage_based,
            userId: user.id as string,
            planId: plan.id,
          };

          // Créer/mettre à jour l'abonnement dans la base de données.
          try {
            await db.subscription.upsert({
              where: { lemonSqueezyId: updateData.lemonSqueezyId },
              update: updateData,
              create: updateData,
            });
          } catch (error) {
            processingError = `Failed to upsert Subscription #${updateData.lemonSqueezyId} to the database.`;
            console.error(error);
          }
        }
      } else if (webhookEvent.eventName.startsWith("order_")) {
        // Enregistrer les commandes ; eventBody est un "Order"
        /* Pas encore implémenté */
      } else if (webhookEvent.eventName.startsWith("license_")) {
        // Enregistrer les clés de licence ; eventBody est une "License key"
        /* Pas encore implémenté */
      }

      // Mettre à jour l'événement webhook dans la base de données.
      await db.webhookEvent.update({
        where: { id: webhookEvent.id },
        data: {
          processed: true,
          processingError,
        },
      });
    }
  } catch (error) {
    console.error('Error processing webhook event:', error);
  } finally {
    await db.$disconnect();
  }
}



export async function storeWebhookEvent(
  eventName: string,
  body: webhookEvent["body"],
) {
  try {
    await db.$connect();

    const returnedValue = await db.webhookEvent.create({
      data: {
        id: v4(),
        eventName,
        processed: false,
        body: body as any,
      },
    });

    return returnedValue;
  } catch (error) {
    console.error('Error storing webhook event:', error);
    throw error;
  } finally {
    await db.$disconnect();
  }
}


export async function cancelUserSubscription(id: string) {
  configureLemonSqueezy();


  const userSubscriptions = await getUserSubscriptions();


  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id,
  );

  if (!subscription) {
    throw new Error(`Abonnement #${id} introuvable.`);
  }

  const cancelledSub = await cancelSubscription(id);

  if (cancelledSub.error) {
    throw new Error(cancelledSub.error.message);
  }


  try {
    await db.subscription.update({
      where: { lemonSqueezyId: id },
      data: {
        status: cancelledSub.data?.data.attributes.status,
        statusFormatted: cancelledSub.data?.data.attributes.status_formatted,
        endsAt: cancelledSub.data?.data.attributes.ends_at,
      },
    });
  } catch (error) {
    console.log('🔴Error updating subscription in database | cancelUserSubscription', error);
    throw new Error(`Échec de l'annulation de l'abonnement #${id} dans la base de données.`);
  }


  return cancelledSub;
}


export async function getSubscriptionURLs(id: string) {
  configureLemonSqueezy();
  const subscription = await getSubscription(id);

  if (subscription.error) {
    throw new Error(subscription.error.message);
  }

  return subscription.data?.data.attributes.urls;
}



export async function pauseUserSubscription(id: string) {
  configureLemonSqueezy();


  const userSubscriptions = await getUserSubscriptions();


  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id,
  );

  if (!subscription) {
    throw new Error(`Abonnement #${id} introuvable.`);
  }

  const returnedSub = await updateSubscription(id, {
    pause: {
      mode: "void",
    },
  });


  try {
    await db.subscription.update({
      where: { lemonSqueezyId: id },
      data: {
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      },
    });
  } catch (error) {
    console.log('🔴Error updating subscription in database | pauseUserSubscription', error);
    throw new Error(`Échec de la mise en pause de l'abonnement #${id} dans la base de données.`);
  }


  return returnedSub;
}


export async function unpauseUserSubscription(id: string) {
  configureLemonSqueezy();


  const userSubscriptions = await getUserSubscriptions();


  const subscription = userSubscriptions.find(
    (sub) => sub.lemonSqueezyId === id,
  );

  if (!subscription) {
    throw new Error(`Abonnement #${id} introuvable.`);
  }

  const returnedSub = await updateSubscription(id, {
    pause: null,
  });


  try {
    await db.subscription.update({
      where: { lemonSqueezyId: id },
      data: {
        status: returnedSub.data?.data.attributes.status,
        statusFormatted: returnedSub.data?.data.attributes.status_formatted,
        endsAt: returnedSub.data?.data.attributes.ends_at,
        isPaused: returnedSub.data?.data.attributes.pause !== null,
      },
    });
  } catch (error) {
    console.log('🔴Error updating subscription in database | unpauseUserSubscription', error);
    throw new Error(`Échec de la mise en pause de l'abonnement #${id} dans la base de données.`);
  }

  return returnedSub;
}