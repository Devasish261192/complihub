import prisma from "@/lib/prisma"

export default async function FrameworkPage(
  { params }: { params: { id: string } }
) {

  const { id } = params

  const framework = await prisma.framework.findUnique({
    where: { id },
    include: {
      controls: {
        include: {
          requirements: true
        }
      }
    }
  })

  if (!framework) {
    return <div className="p-8">Framework not found</div>
  }

  return (
    <div className="p-8">

      <h1 className="text-3xl font-bold mb-2">
        {framework.name}
      </h1>

      <p className="mb-6">{framework.description}</p>

      {framework.controls.map(control => (
        <div key={control.id} className="mb-6">

          <h2 className="text-xl font-semibold">
            {control.name}
          </h2>

          <ul className="list-disc ml-6 mt-2">
            {control.requirements.map(req => (
              <li key={req.id}>
                {req.description}
              </li>
            ))}
          </ul>

        </div>
      ))}

    </div>
  )
}
