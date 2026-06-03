const products = [
  { name: "phone", price: 300 },
  { name: "laptop", price: 1200 },
  { name: "earbuds", price: 80 },
  { name: "monitor", price: 450 }
];

const productNames = products.map((product)=>product.name)

console.log(productNames)


const over200 = products.filter((product)=>(
    product.price > 200
))

console.log(over200)