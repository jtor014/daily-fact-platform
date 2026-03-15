terraform {
  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.0"
    }
  }
  required_version = ">= 1.0"
}

provider "aws" {
  region = var.aws_region
}

# --- SSH Key Pair ---

resource "aws_key_pair" "deploy" {
  key_name   = var.key_name
  public_key = file(var.public_key_path)
}

# --- Security Group ---

resource "aws_security_group" "dailyfact" {
  name        = "dailyfact-sg"
  description = "Allow HTTP and SSH for Daily Fact Platform"

  ingress {
    description = "HTTP"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  ingress {
    description = "SSH"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["${var.my_ip}/32"]
  }

  egress {
    description = "All outbound"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "dailyfact-sg"
  }
}

# --- EC2 Instance ---

resource "aws_instance" "dailyfact" {
  ami                    = "ami-0c421724a94bba6d6"
  instance_type          = var.instance_type
  key_name               = aws_key_pair.deploy.key_name
  vpc_security_group_ids = [aws_security_group.dailyfact.id]

  user_data = <<-USERDATA
    #!/bin/bash
    set -euo pipefail

    # Install Docker
    dnf update -y
    dnf install -y docker git
    systemctl enable docker
    systemctl start docker

    # Install Docker Compose plugin
    mkdir -p /usr/local/lib/docker/cli-plugins
    curl -SL "https://github.com/docker/compose/releases/latest/download/docker-compose-linux-x86_64" \
      -o /usr/local/lib/docker/cli-plugins/docker-compose
    chmod +x /usr/local/lib/docker/cli-plugins/docker-compose

    # Install Docker Buildx plugin (Compose v5 requires buildx >= 0.17)
    curl -SL "https://github.com/docker/buildx/releases/download/v0.24.0/buildx-v0.24.0.linux-amd64" \
      -o /usr/local/lib/docker/cli-plugins/docker-buildx
    chmod +x /usr/local/lib/docker/cli-plugins/docker-buildx

    # Add ec2-user to docker group
    usermod -aG docker ec2-user

    # Install Make
    dnf install -y make
  USERDATA

  root_block_device {
    volume_size = 20
    volume_type = "gp3"
  }

  tags = {
    Name = "dailyfact-server"
  }
}

# --- Outputs ---

output "public_ip" {
  description = "Public IP of the EC2 instance"
  value       = aws_instance.dailyfact.public_ip
}

output "ssh_command" {
  description = "SSH command to connect to the instance"
  value       = "ssh -i ~/.ssh/dailyfact-key ec2-user@${aws_instance.dailyfact.public_ip}"
}
