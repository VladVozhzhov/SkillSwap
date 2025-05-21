package model

import (
	"github.com/google/uuid"
	"gorm.io/gorm/clause"
)

type UserKey struct {
	UserID    uuid.UUID `gorm:"type:uuid;primaryKey"`
	PublicKey string    `gorm:"type:text"` // PEM format
}

func StorePublicKey(userID uuid.UUID, publicKeyPEM string) error {
	key := UserKey{
		UserID:    userID,
		PublicKey: publicKeyPEM,
	}
	return DB.Clauses(clause.OnConflict{UpdateAll: true}).Create(&key).Error
}
