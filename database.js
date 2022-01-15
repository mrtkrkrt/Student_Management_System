let promise = new Promise((resolve, reject) => {
  console.log("1.")
  resolve()
}).then(() => {
  fori
  console.log("2.")
}).then(() => {
  console.log("3.")
})