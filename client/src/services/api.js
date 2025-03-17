export default {
  request(method, endpoint, data = null) {
    return new Promise((resolve, reject) => {
      console.log(`API ${method} request to ${endpoint}`)

      const xhr = new XMLHttpRequest()
      // Use relative URL for API requests in production
      xhr.open(method, `/api${endpoint}`)
      xhr.setRequestHeader("Content-Type", "application/json")
      xhr.withCredentials = true

      xhr.onload = () => {
        console.log(`API response status for ${endpoint}: ${xhr.status}`)

        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const response = JSON.parse(xhr.responseText)
            console.log(`API response from ${endpoint}:`, response)

            // Store the response in sessionStorage for certain endpoints
            if (endpoint.startsWith("/plants/") && method === "GET") {
              try {
                // Store plant details
                sessionStorage.setItem(`plant_${endpoint.split("/")[2]}`, JSON.stringify(response))
              } catch (e) {
                console.warn("Failed to store plant data in sessionStorage:", e)
              }
            } else if (endpoint === "/care-logs" && method === "GET") {
              try {
                // Store care logs
                sessionStorage.setItem("care_logs", JSON.stringify(response))
              } catch (e) {
                console.warn("Failed to store care logs in sessionStorage:", e)
              }
            }

            resolve(response)
          } catch (e) {
            console.log(`API response from ${endpoint} (not JSON):`, xhr.responseText)
            resolve(xhr.responseText)
          }
        } else {
          let errorMessage = "An error occurred"
          try {
            const errorData = JSON.parse(xhr.responseText)
            errorMessage = errorData.message || errorData.error || errorMessage
          } catch (e) {
            console.error(`Failed to parse error response for ${endpoint}:`, xhr.responseText)
          }

          console.error(`API error (${xhr.status}) from ${endpoint}:`, errorMessage)
          reject({
            status: xhr.status,
            message: errorMessage,
          })
        }
      }

      xhr.onerror = () => {
        console.error(`Network error for ${endpoint}`)
        reject({ status: 0, message: "Network Error" })
      }

      if (data) {
        console.log(`Request data for ${endpoint}:`, data)
      }

      xhr.send(data ? JSON.stringify(data) : null)
    })
  },

  // Helper methods for common HTTP requests
  get(endpoint) {
    if (endpoint.startsWith("/plants/") && endpoint.split("/").length === 3) {
      const plantId = endpoint.split("/")[2]
      const cachedData = sessionStorage.getItem(`plant_${plantId}`)

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          console.log(`Using cached data for ${endpoint}`)

          this.request("GET", endpoint)
            .then((freshData) => {
              sessionStorage.setItem(`plant_${plantId}`, JSON.stringify(freshData))
            })
            .catch((err) => console.warn(`Background refresh failed for ${endpoint}:`, err))

          return Promise.resolve(parsedData)
        } catch (e) {
          console.warn("Failed to parse cached data:", e)
        }
      }
    } else if (endpoint === "/care-logs") {
      const cachedData = sessionStorage.getItem("care_logs")

      if (cachedData) {
        try {
          const parsedData = JSON.parse(cachedData)
          console.log(`Using cached data for ${endpoint}`)

          this.request("GET", endpoint)
            .then((freshData) => {
              sessionStorage.setItem("care_logs", JSON.stringify(freshData))
            })
            .catch((err) => console.warn(`Background refresh failed for ${endpoint}:`, err))

          return Promise.resolve(parsedData)
        } catch (e) {
          console.warn("Failed to parse cached data:", e)
        }
      }
    }

    return this.request("GET", endpoint)
  },

  post(endpoint, data) {
    return this.request("POST", endpoint, data).then((response) => {
      if (endpoint === "/care-logs") {
        const cachedData = sessionStorage.getItem("care_logs")
        if (cachedData) {
          try {
            const parsedData = JSON.parse(cachedData)
            parsedData.unshift(response) // Add new care log to the beginning
            sessionStorage.setItem("care_logs", JSON.stringify(parsedData))
          } catch (e) {
            console.warn("Failed to update cached care logs:", e)
          }
        }
      }
      return response
    })
  },

  put(endpoint, data) {
    return this.request("PUT", endpoint, data)
  },

  delete(endpoint) {
    return this.request("DELETE", endpoint)
  },

  // Care Log specific methods
  getCareLogs() {
    return this.get("/care-logs")
  },

  getPlantCareLogs(plantId) {
    return this.get(`/plants/${plantId}/care-logs`)
  },

  createCareLog(careLogData) {
    return this.post("/care-logs", careLogData)
  },

  updateCareLog(careLogId, careLogData) {
    return this.put(`/care-logs/${careLogId}`, careLogData)
  },

  deleteCareLog(careLogId) {
    return this.delete(`/care-logs/${careLogId}`)
  },
}