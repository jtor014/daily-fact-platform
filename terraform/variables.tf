variable "aws_region" {
  description = "AWS region to deploy into"
  type        = string
  default     = "us-east-1"
}

variable "instance_type" {
  description = "EC2 instance type (t2.micro is free-tier eligible)"
  type        = string
  default     = "t2.micro"
}

variable "my_ip" {
  description = "Your public IP for SSH access (CIDR notation)"
  type        = string
}

variable "key_name" {
  description = "Name for the AWS key pair"
  type        = string
  default     = "dailyfact-key"
}

variable "public_key_path" {
  description = "Path to the SSH public key file"
  type        = string
  default     = "~/.ssh/dailyfact-key.pub"
}
