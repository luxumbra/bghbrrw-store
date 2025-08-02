import { Metadata } from "next"

import OrderOverview from "@modules/account/components/order-overview"
import { notFound } from "next/navigation"
import { listOrders } from "@lib/data/orders"
import { getReviewableOrders } from "@lib/data/customer"
import Divider from "@modules/common/components/divider"
import TransferRequestForm from "@modules/account/components/transfer-request-form"

export const metadata: Metadata = {
  title: "Orders",
  description: "Overview of your previous orders.",
}

export default async function Orders() {
  const orders = await listOrders()
  const reviewableOrders = await getReviewableOrders()

  if (!orders) {
    notFound()
  }

  // Merge reviewable status into regular orders
  const ordersWithReviewStatus = orders.map(order => {
    const reviewableOrder = reviewableOrders.orders.find(ro => ro.id === order.id)
    
    // If this order appears in reviewable orders, it means it has delivered items
    const orderHasDeliveredItems = !!reviewableOrder
    
    return {
      ...order,
      has_delivered_items: orderHasDeliveredItems,
      items: order.items?.map(item => {
        const reviewableItem = reviewableOrder?.items?.find(ri => ri.product_id === item.product_id)
        return {
          ...item,
          can_review: reviewableItem?.can_review ?? false,
          // Mark items as delivered if they appear in any reviewable order context
          is_delivered: orderHasDeliveredItems
        }
      })
    }
  })

  return (
    <div className="w-full" data-testid="orders-page-wrapper">
      <div className="mb-8 flex flex-col gap-y-4">
        <h1 className="text-2xl-semi">Orders</h1>
        <p className="text-base-regular">
          View your previous orders and their status. You can also create
          returns or exchanges for your orders if needed.
        </p>
      </div>
      <div>
        <OrderOverview orders={ordersWithReviewStatus} />
        <Divider className="my-16" />
        <TransferRequestForm />
      </div>
    </div>
  )
}
