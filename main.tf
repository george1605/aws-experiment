terraform {
    required_providers {
        aws = {
            source  = "hashicorp/aws"
            version = "~> 6.0"
        }
    }
}

provider "aws" {
    region = "eu-north-1"
}

resource "aws_s3_bucket" "test" {
    bucket = "george-terraform-bucket-13190"
}

resource "aws_s3_bucket_versioning" "v" {
    bucket = aws_s3_bucket.test.id
    versioning_configuration {
        status = "Enabled"
    }
}