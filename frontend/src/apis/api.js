import axios from "axios";
export  const fetch_data = async () => {
  try {
    const response = await axios.get("http://localhost:8000/fetch_files");
    if (response.status == 200){
      return response.data.files;
    }
    return []; 
  } catch (error) {
    console.error("Error fetching data:", error);
    return [];
  }
};


export default  fetch_data