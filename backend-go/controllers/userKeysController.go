package controllers

import (
	"net/http"

	"github.com/VladVozhzhov/SkillSwap/model"
	"github.com/gin-gonic/gin"
)

func UploadPublicKeyHandler(c *gin.Context) {
	userID, err := getUserIDFromRequest(c)
	if err != nil {
		c.JSON(http.StatusUnauthorized, gin.H{"error": "Unauthorized"})
		return
	}

	var req struct {
		PublicKey string `json:"publicKey"`
	}

	if err := c.ShouldBindJSON(&req); err != nil || req.PublicKey == "" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid public key"})
		return
	}

	err = model.StorePublicKey(userID, req.PublicKey)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to store public key"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"status": "Public key stored"})
}
