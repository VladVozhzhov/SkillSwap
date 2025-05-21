package model

import (
	"crypto/rand"
	"crypto/rsa"
	"crypto/x509"
	"encoding/base64"
	"encoding/pem"
	"errors"
	"fmt"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

var DB *gorm.DB

type Message struct {
	ID         uuid.UUID `json:"id" gorm:"type:uuid;primaryKey"`
	SenderID   uuid.UUID `json:"senderId" gorm:"type:uuid"`
	ReceiverID uuid.UUID `json:"receiverId" gorm:"type:uuid;column:recipient_id"`
	Body       string    `json:"body"` // Encrypted
	Timestamp  string    `json:"timestamp"`
}

// Helper Functions

// Get recipient's public key from the DB
func getPublicKey(userID uuid.UUID) (*rsa.PublicKey, error) {
	var userKey UserKey
	if err := DB.First(&userKey, "user_id = ?", userID).Error; err != nil {
		return nil, err
	}

	block, _ := pem.Decode([]byte(userKey.PublicKey))
	if block == nil {
		return nil, errors.New("failed to parse PEM block")
	}

	pub, err := x509.ParsePKIXPublicKey(block.Bytes)
	if err != nil {
		return nil, err
	}

	rsaPub, ok := pub.(*rsa.PublicKey)
	if !ok {
		return nil, errors.New("not RSA public key")
	}
	return rsaPub, nil
}

// Encrypt the message using the recipient's public key
func encryptMessageRSA(plaintext string, pub *rsa.PublicKey) (string, error) {
	ciphertext, err := rsa.EncryptPKCS1v15(rand.Reader, pub, []byte(plaintext))
	if err != nil {
		return "", err
	}
	return base64.StdEncoding.EncodeToString(ciphertext), nil
}

// DB Logic

func CreateMessage(msg *Message) error {
	pubKey, err := getPublicKey(msg.ReceiverID)
	if err != nil {
		return fmt.Errorf("public key not found for receiver %s: %w", msg.ReceiverID, err)
	}

	encrypted, err := encryptMessageRSA(msg.Body, pubKey)
	if err != nil {
		return err
	}
	msg.Body = encrypted

	return DB.Create(msg).Error
}

func GetMessagesByUser(userID uuid.UUID) ([]Message, error) {
	var messages []Message
	err := DB.
		Where("sender_id = ? OR recipient_id = ?", userID, userID).
		Order("timestamp DESC").
		Find(&messages).Error

	if err != nil {
		return nil, err
	}

	for i := range messages {
		messages[i].Body = "[Encrypted]"
	}

	return messages, nil
}

func DeleteMessage(msgID, userID uuid.UUID) error {
	result := DB.Where("id = ? AND sender_id = ?", msgID, userID).Delete(&Message{})
	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}

func UpdateMessage(msgID, userID uuid.UUID, newBody string) error {
	// Get the recipient ID first
	var msg Message
	if err := DB.First(&msg, "id = ? AND sender_id = ?", msgID, userID).Error; err != nil {
		return err
	}

	pubKey, err := getPublicKey(msg.ReceiverID)
	if err != nil {
		return err
	}

	encrypted, err := encryptMessageRSA(newBody, pubKey)
	if err != nil {
		return err
	}

	result := DB.Model(&Message{}).
		Where("id = ? AND sender_id = ?", msgID, userID).
		Update("body", encrypted)

	if result.RowsAffected == 0 {
		return gorm.ErrRecordNotFound
	}
	return result.Error
}
