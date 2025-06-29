export const GET = async (_request: Request) => {
  // If you need to use the local API, import and use Payload directly.
  // Otherwise, remove the payload.init line if not required.

  return Response.json({
    message: 'This is an example of a custom route.',
  })
}
