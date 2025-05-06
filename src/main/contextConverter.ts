export default function convertContext(context: { user: string[]; model: string[] }) {
  const previousContext: { role: string; parts: { text: string }[] }[] = []

  for (let i = 0; i < context.user.length; i++) {
    if (context.user[i]) {
      previousContext.push({
        role: 'user',
        parts: [{ text: context.user[i] }]
      })
    }

    if (context.model[i]) {
      previousContext.push({
        role: 'model',
        parts: [{ text: context.model[i] }]
      })
    }
  }
  
    previousContext.forEach((item) => {
      for (const element of item.parts) {
        console.log('converted text!!!!:', element.text)
      }
    })
  
  // console.log('converted context:', previousContext)

  return previousContext
}
