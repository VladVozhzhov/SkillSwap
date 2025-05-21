package controllers

import (
	"fmt"
	"time"

	"github.com/VladVozhzhov/SkillSwap/model"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
)

// Extract user ID from context (set by JWT middleware)
func getUserIDFromRequest(c *gin.Context) (uuid.UUID, error) {
	userIDVal, exists := c.Get("userID")
	if !exists {
		return uuid.Nil, fmt.Errorf("userID not found in context")
	}

	userIDStr, ok := userIDVal.(string)
	if !ok {
		return uuid.Nil, fmt.Errorf("userID is not a string")
	}

	userID, err := uuid.Parse(userIDStr)
	if err != nil {
		return uuid.Nil, err
	}

	return userID, nil
}

// SendMessageHandler creates a new message in the DB
func SendMessageHandler(c *gin.Context) {
	userID, err := getUserIDFromRequest(c)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	var msg model.Message
	if err := c.ShouldBindJSON(&msg); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	fmt.Printf("Received message: %+v\n", msg)

	if msg.ReceiverID == uuid.Nil {
		c.JSON(400, gin.H{"error": "receiverId missing or invalid"})
		return
	}
	if msg.Body == "" {
		c.JSON(400, gin.H{"error": "message body is empty"})
		return
	}

	msg.ID = uuid.New()
	msg.SenderID = userID
	msg.Timestamp = time.Now().Format(time.RFC3339)

	if err := model.CreateMessage(&msg); err != nil {
		c.JSON(500, gin.H{"error": "Failed to send message"})
		return
	}

	c.JSON(201, gin.H{"status": "message sent", "message": msg})
}

// GetMessagesHandler returns messages involving the user from JWT
func GetMessagesHandler(c *gin.Context) {
	userID, err := getUserIDFromRequest(c)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	messages, err := model.GetMessagesByUser(userID)
	if err != nil {
		c.JSON(500, gin.H{"error": "Failed to get messages"})
		return
	}

	c.JSON(200, messages)
}

// DeleteMessageHandler deletes a message if the user is the sender
func DeleteMessageHandler(c *gin.Context) {
	userID, err := getUserIDFromRequest(c)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	msgIDStr := c.Param("id")
	msgID, err := uuid.Parse(msgIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid message ID"})
		return
	}

	if err := model.DeleteMessage(msgID, userID); err != nil {
		c.JSON(404, gin.H{"error": "Message not found or not authorized"})
		return
	}

	c.JSON(200, gin.H{"status": "message deleted"})
}

// UpdateMessageHandler updates a message body if the user is the sender
func UpdateMessageHandler(c *gin.Context) {
	userID, err := getUserIDFromRequest(c)
	if err != nil {
		c.JSON(401, gin.H{"error": "Unauthorized"})
		return
	}

	msgIDStr := c.Param("id")
	msgID, err := uuid.Parse(msgIDStr)
	if err != nil {
		c.JSON(400, gin.H{"error": "Invalid message ID"})
		return
	}

	var updated struct {
		Body string `json:"body"`
	}
	if err := c.ShouldBindJSON(&updated); err != nil {
		c.JSON(400, gin.H{"error": "Invalid request body"})
		return
	}

	if err := model.UpdateMessage(msgID, userID, updated.Body); err != nil {
		c.JSON(404, gin.H{"error": "Message not found or not authorized"})
		return
	}

	c.JSON(200, gin.H{"status": "message updated", "message": updated.Body})
}
