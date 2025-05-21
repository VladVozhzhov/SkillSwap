package routes

import (
	"github.com/VladVozhzhov/SkillSwap/controllers"
	middlewares "github.com/VladVozhzhov/SkillSwap/middleware"
	"github.com/gin-gonic/gin"
)

func SetupRoutes(router *gin.Engine) {
	router.POST("/api/keys", controllers.UploadPublicKeyHandler)

	r := router.Group("/api/messages")
	r.Use(middlewares.JWTVerify())
	r.GET("/", controllers.GetMessagesHandler)
	r.POST("/", controllers.SendMessageHandler)
	r.PUT("/:id", controllers.UpdateMessageHandler)
	r.DELETE("/:id", controllers.DeleteMessageHandler)
}
