import { useState } from "react";
import "./home.css"

const  Homepage= () => {
    const [blogs, setBlogs] = useState([
        {auth: "auth1", title: "title1", id: 1},
         {auth: "auth2", title: "title2", id: 2},
          {auth: "auth3", title: "title3", id: 3},
    ]);
    return(
        <div className="blogs">
            {blogs.map((blog)=> (
                <div className="blogpreview" key= {blog.key}>
                    <h2> {blog.title}</h2>
                    <p>title:  {blog.auth}</p>
                </div>
            ))}
        </div>
    );
}
 
export default Homepage;