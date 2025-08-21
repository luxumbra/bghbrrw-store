// Health check endpoint for monitoring and Docker health checks
export async function GET() {
  try {
    // Basic health check - could be expanded to check backend connectivity
    return Response.json(
      { 
        status: 'healthy', 
        timestamp: new Date().toISOString(),
        service: 'bough-burrow-frontend'
      },
      { status: 200 }
    )
  } catch (error) {
    return Response.json(
      { 
        status: 'unhealthy', 
        timestamp: new Date().toISOString(),
        service: 'bough-burrow-frontend',
        error: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}