// Load environment variables if they are not already loaded
require("dotenv").config();

// Bot configuration
const config = {
  prefix: process.env.PREFIX,
  devToken: process.env.DEV_TOKEN,
  token: process.env.TOKEN,
  footerText: process.env.FOOTER_TEXT,
  footerIcon: process.env.FOOTER_ICON,
  color: process.env.COLOR,
  version: process.env.VERSION,
};

// Email settings
const emailConfig = {
  mailgunApiToken: process.env.MAILGUN_API_TOKEN,
  smtpPassword: process.env.SMTP_PASSWORD,
};

// Security
const securityConfig = {
  salt: process.env.SALT,
};

// External services
const services = {
  vtToken: process.env.VT_TOKEN,
  mongoUrl: process.env.MONGO_URL,
};

// Server configuration
const pebblehostConfig = {
  serverId: process.env.PEBBLEHOST_SERVER_ID,
  user: process.env.PEBBLEHOST_USER,
  key: process.env.PEBBLEHOST_KEY,
};

// URL configuration
const urlConfig = {
  blacklist: process.env.URL_BLACKLIST
    ? process.env.URL_BLACKLIST.split(",")
    : [],
};

// Export configuration
module.exports = {
  config,
  emailConfig,
  securityConfig,
  services,
  pebblehostConfig,
  urlConfig,
};
