package main

import (
	"github.com/VladVozhzhov/SkillSwap/config"
	"github.com/VladVozhzhov/SkillSwap/routes"

	"github.com/gin-gonic/gin"
)

func main() {
	config.LoadEnv()
	config.ConnectDatabase()

	router := gin.Default()
	router.SetTrustedProxies([]string{"127.0.0.1"})
	routes.SetupRoutes(router)
	router.Run(":8080")
}
