export default{
  async login(username, password){
    try{
      const response = await fetch("http://localhost:5000/login", {
      method: "POST",
      headers: {"content-typeof": "application/json"},
      body: JSON.stringify({username, password}),
      });

      const data = await response.json();

      if (!response.ok){
        throw new Error(data.message || "Login Failed")
      }

      localStorage.setItem("token", data.token)

      
    }
  }
}
