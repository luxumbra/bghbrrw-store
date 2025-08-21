import { defineRouteConfig } from "@medusajs/admin-sdk"
import { ChatBubbleLeftRight } from "@medusajs/icons"
import {
  createDataTableColumnHelper,
  Container,
  DataTable,
  useDataTable,
  Heading,
  createDataTableCommandHelper,
  DataTableRowSelectionState,
  StatusBadge,
  Toaster,
  toast,
  DataTablePaginationState
} from "@medusajs/ui"
import { useQuery } from "@tanstack/react-query"
import { useMemo, useState } from "react"
import { sdk } from "../../lib/sdk"
import { HttpTypes } from "@medusajs/framework/types"
import { Link } from "react-router-dom"

type Review = {
  id: string
  title?: string
  content: string
  rating: number
  product_id: string
  collection_id?: string
  order_id?: string
  customer_id?: string
  status: "pending" | "approved" | "rejected"
  created_at: Date
  updated_at: Date
  product?: HttpTypes.AdminProduct
  customer?: HttpTypes.AdminCustomer
}


const columnHelper = createDataTableColumnHelper<Review>()

const ExpandButton = ({ reviewId, isExpanded, onToggle }: {
  reviewId: string,
  isExpanded: boolean,
  onToggle: (id: string) => void
}) => (
  <button
    onClick={() => onToggle(reviewId)}
    className="text-sm text-blue-600 hover:text-blue-800"
  >
    {isExpanded ? '▼' : '▶'}
  </button>
)

const columns = (expandedRows: Set<string>, toggleExpand: (id: string) => void) => [
  columnHelper.select(),
  columnHelper.display({
    id: "expand",
    header: "",
    cell: ({ row }) => (
      <ExpandButton
        reviewId={row.original.id}
        isExpanded={expandedRows.has(row.original.id)}
        onToggle={toggleExpand}
      />
    )
  }),
  columnHelper.accessor("id", {
    header: "ID",
    cell: ({ row }) => row.original.id.substring(0, 8) + "..."
  }),
  columnHelper.accessor("title", {
    header: "Title",
    cell: ({ row }) => {
      const title = row.original.title
      if (!title) return <span className="text-gray-400">—</span>
      return title.length > 30 ? `${title.substring(0, 30)}...` : title
    }
  }),
  columnHelper.accessor("rating", {
    header: "Rating",
  }),
  columnHelper.accessor("content", {
    header: "Content",
    cell: ({ row }) => {
      const content = row.original.content
      return (
        <div className="max-w-xs">
          <span title={content}>
            {content.length > 50 ? `${content.substring(0, 50)}...` : content}
          </span>
        </div>
      )
    }
  }),
  columnHelper.accessor("customer_id", {
    header: "Reviewer", 
    cell: ({ row }) => {
      const customer = row.original.customer;
      if (customer && customer.first_name && customer.last_name) {
        return `${customer.first_name} ${customer.last_name}`;
      }
      return row.original.customer_id || "Anonymous";
    }
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: ({ row }) => {
      const color = row.original.status === "approved" ?
        "green" : row.original.status === "rejected"
        ? "red" : "grey"
      return (
        <StatusBadge color={color}>
          {row.original.status.charAt(0).toUpperCase() + row.original.status.slice(1)}
          </StatusBadge>
      )
    }
  }),
  columnHelper.accessor("order_id", {
    header: "Order ID",
    cell: ({ row }) => {
      const orderId = row.original.order_id
      if (!orderId) {
        return <span className="text-gray-400">No Order ID</span>
      }
      return (
        <Link
          to={`/orders/${orderId}`}
        >
          {orderId.startsWith('legacy-') ? 'Legacy' : orderId}
        </Link>
      )
    }
  }),
  columnHelper.accessor("product_id", {
    header: "Product ID",
    cell: ({ row }) => {
      return (
        <Link
          to={`/products/${row.original.product_id}`}
        >
          {row.original.product?.title || row.original.product_id}
        </Link>
      )
    }
  }),
]

const commandHelper = createDataTableCommandHelper()

const useCommands = (refetch: () => void) => {
  return [
    commandHelper.command({
      label: "Approve",
      shortcut: "A",
      action: async (selection) => {
        const reviewsToApproveIds = Object.keys(selection)

        sdk.client.fetch("/admin/reviews/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ids: reviewsToApproveIds,
            status: "approved"
          })
        }).then(() => {
          toast.success("Reviews approved")
          refetch()
        }).catch((error) => {
          console.error("Failed to approve reviews:", error)
          toast.error("Failed to approve reviews")
        })
      }
    }),
    commandHelper.command({
      label: "Reject",
      shortcut: "R",
      action: async (selection) => {
        const reviewsToRejectIds = Object.keys(selection)

        sdk.client.fetch("/admin/reviews/status", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            ids: reviewsToRejectIds,
            status: "rejected"
          })
        }).then(() => {
          toast.success("Reviews rejected")
          refetch()
        }).catch((error) => {
          console.error("Failed to reject reviews:", error)
          toast.error("Failed to reject reviews")
        })
      }
    })
  ]
}


const limit = 15

const ReviewsPage = () => {
  const [pagination, setPagination] = useState<DataTablePaginationState>({
    pageSize: limit,
    pageIndex: 0
  })
  const [rowSelection, setRowSelection] = useState<DataTableRowSelectionState>({})
  const [expandedRows, setExpandedRows] = useState<Set<string>>(new Set())

  const toggleExpand = (id: string) => {
    const newExpanded = new Set(expandedRows)
    if (newExpanded.has(id)) {
      newExpanded.delete(id)
    } else {
      newExpanded.add(id)
    }
    setExpandedRows(newExpanded)
  }

  const offset = useMemo(() => {
    return pagination.pageIndex * limit
  }, [pagination])

  const { data, isLoading, refetch } = useQuery<{
    reviews: Review[]
    count: number
    limit: number
    offset: number
  }>({
    queryKey: ["reviews", offset, limit],
    queryFn: () => {
      const params = new URLSearchParams({
        offset: (pagination.pageIndex * pagination.pageSize).toString(),
        limit: pagination.pageSize.toString(),
        order: "-created_at"
      });
      return sdk.client.fetch(`/admin/reviews?${params.toString()}`);
    }
  })

  const commands = useCommands(refetch)

  const table = useDataTable({
    columns: columns(expandedRows, toggleExpand),
    data: data?.reviews || [],
    rowCount: data?.count || 0,
    isLoading,
    pagination: {
      state: pagination,
      onPaginationChange: setPagination
    },
    commands,
    rowSelection: {
      state: rowSelection,
      onRowSelectionChange: setRowSelection
    },
    getRowId: (row) => row.id
  })

  return (
    <Container>
      <DataTable instance={table}>
        <DataTable.Toolbar className="flex flex-col items-start justify-between gap-2 md:flex-row md:items-center">
          <Heading>
            Reviews
          </Heading>
        </DataTable.Toolbar>
        <DataTable.Table />
        <DataTable.Pagination />
        <DataTable.CommandBar selectedLabel={(count) => `${count} selected`} />
      </DataTable>

      {/* Expanded Row Details */}
      {data?.reviews?.filter(review => expandedRows.has(review.id)).map(review => (
        <div key={`expanded-${review.id}`} className="p-4 mt-4 border rounded-lg bg-primary-bg">
          <h3 className="mb-2 font-semibold">Review Details</h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <strong>ID:</strong> {review.id}
            </div>
            <div>
              <strong>Order ID:</strong> {review.order_id || 'No Order ID'}
            </div>
            <div>
              <strong>Product ID:</strong> {review.product_id}
            </div>
            <div>
              <strong>Rating:</strong> {review.rating}/5
            </div>
            <div className="col-span-2">
              <strong>Title:</strong> {review.title || 'No title'}
            </div>
            <div className="col-span-2">
              <strong>Full Content:</strong>
              <p className="mt-1 whitespace-pre-wrap">{review.content}</p>
            </div>
          </div>
        </div>
      ))}

      <Toaster />
    </Container>
  )
}

export const config = defineRouteConfig({
  label: "Reviews",
  icon: ChatBubbleLeftRight
})

export default ReviewsPage
