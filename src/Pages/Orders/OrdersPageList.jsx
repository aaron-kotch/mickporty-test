import React from "react";
import { EmptyState } from "@Common/EmptyState/EmptyState";
import { OrderCard } from "@Common/OrderCard/OrderCard";
import "./Orders.scss";

const OrdersPageList = React.memo(({selectedTab, pendingOrders = [], historyOrders = [], navigateToOrderDetails, onReview, onReorder, showImage = true, reviewedOrders}) => {
  if((selectedTab === 0 && pendingOrders && pendingOrders.length === 0) || (selectedTab === 1 && historyOrders && historyOrders.length === 0)){
    return <div className="empty-state-container">
        <EmptyState
      title="Your order list is empty."
      description="Continue shopping and get it filled with your order(s)."
      />
    </div>
  }
  return selectedTab === 0 ? pendingOrders.map((item, index) => (
      <OrderCard
        {...item}
        key={index}
        onClick={() => navigateToOrderDetails(item)}
        onReview={(ev) => onReview(ev, item)}
        onReorder={(ev) => onReorder(ev, item)}
        showImage={showImage}
      />
    )) : historyOrders.map((item, index) => (
      <OrderCard
        {...item}
        key={index}
        onClick={() => navigateToOrderDetails(item)}
        onReview={(ev) => onReview(ev, item)}
        onReorder={(ev) => onReorder(ev, item)}
        showImage={showImage}
        reviewedOrders={reviewedOrders}
      />
    ))
})

export default OrdersPageList;