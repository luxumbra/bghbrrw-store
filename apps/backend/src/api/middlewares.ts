import { defineMiddlewares, authenticate } from "@medusajs/framework/http"
import { z } from "zod"
import { PostStoreReviewSchema } from "./store/reviews/route"
import { GetStoreReviewsSchema } from "./store/products/[id]/reviews/route"
import { GetAdminReviewsSchema } from "./admin/reviews/route"
import { PostAdminReviewsStatusSchema } from "./admin/reviews/status/route"

export default defineMiddlewares({
  routes: [
    {
      matcher: "/store/reviews",
      method: "POST",
      middlewares: [authenticate("customer", ["bearer"])]
    },
    {
      matcher: "/store/products/:id/reviews", 
      method: "GET",
      middlewares: []
    },
    {
      matcher: "/admin/reviews",
      method: "GET", 
      middlewares: []
    },
    {
      matcher: "/admin/reviews/status",
      method: "POST",
      middlewares: []
    }
  ]
})