
import './seller_products.css'

function SellerProducts({products}) {
  return (
      <div style={{ maxWidth: "900px", margin: "0 auto" }}>
            <div
              className="product-list"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(220px, 1fr))",
                gap: "20px",
                padding: "20px",
              }}
            >
              {products.map((product) => (
                <div
                  key={product._id}
                  className="product-card"
                  style={{
                    backgroundColor: "#fff",
                    padding: "15px",
                    borderRadius: "10px",
                    boxShadow: "0 0 10px rgba(0,0,0,0.1)",
                    textAlign: "center",
                  }}
                >
                  <img
                    src={product.image[0]}
                    alt={product.name}
                    style={{
                      width: "100%",
                      height: "200px",
                      objectFit: "cover",
                      borderRadius: "5px",
                    }}
                  />
                  <h4 style={{ margin: "10px 0 5px" }}>{product.name}</h4>
                  <p style={{ margin: "5px 0", color: "#555" }}>
                    Price: €{product.price}
                  </p>
                  <p style={{ margin: "5px 0", color: "#777" }}>
                    Published:{" "}
                    {new Date(product.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </div>
  );

}
 
export default SellerProducts;
