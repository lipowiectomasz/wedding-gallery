#!/bin/sh
set -e

APPWRITE="npx --yes appwrite-cli"
CLI="$APPWRITE databases"
DB_ID="wedding_gallery"

$CLI create-collection \
  --database-id "$DB_ID" \
  --collection-id profiles \
  --name profiles \
  --permissions 'create("users")' 'read("users")'

$CLI create-string-attribute --database-id "$DB_ID" --collection-id profiles --key userId --size 64 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id profiles --key fullName --size 128 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id profiles --key deviceId --size 64 --required true
$CLI create-integer-attribute --database-id "$DB_ID" --collection-id profiles --key photoCount --required true --min 0 --max 20

$CLI create-index --database-id "$DB_ID" --collection-id profiles --key userId_idx --type unique --attributes userId

$CLI create-collection \
  --database-id "$DB_ID" \
  --collection-id photos \
  --name photos \
  --permissions 'create("users")' 'read("users")'

$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key fileId --size 64 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key uploaderId --size 64 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key uploaderName --size 128 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key deviceId --size 64 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key seq --size 2 --required true
$CLI create-string-attribute --database-id "$DB_ID" --collection-id photos --key fileName --size 256 --required true
$CLI create-integer-attribute --database-id "$DB_ID" --collection-id photos --key fileSize --required true --min 0

$CLI create-index --database-id "$DB_ID" --collection-id photos --key uploader_seq_idx --type unique --attributes uploaderId seq
$CLI create-index --database-id "$DB_ID" --collection-id photos --key uploader_filename_size_idx --type key --attributes uploaderId fileName fileSize

$APPWRITE storage create-bucket \
  --bucket-id event-photos \
  --name event-photos \
  --permissions 'create("users")' 'read("users")' \
  --maximum-file-size 15000000 \
  --allowed-file-extensions jpg jpeg png heic webp \
  --compression none \
  --antivirus false
