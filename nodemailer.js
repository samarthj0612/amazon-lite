const nodemailer = require("nodemailer");
const googleApis = require("googleapis");

const REDIRECT_URI = `https://developers.google.com/oauthplayground`;
const CLIENT_ID = `784232998023-e60hiejb24e168356vrbmv1fp6ums616.apps.googleusercontent.com`;
const CLIENT_SECRET = `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`;
const REFRESH_TOKEN = `1//04qhBjMWBPFBVCgYIARAAGAQSNwF-L9Irqz8HU69MfQcRr2lda4Q0wA9SI3-VBcd8nOLit_LyCoUfG6HdUqeu04DWBAWWPXJIzwI`;

const authClient = new googleApis.google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

authClient.setCredentials({ refresh_token: REFRESH_TOKEN });

async function mailer(useremail, otp) {
  try {
    const ACCESS_TOKEN = await authClient.getAccessToken();

    const transport = nodemailer.createTransport({
      service: "gmail",
      auth: {
        type: "OAuth2",
        user: "spunkysam02@gmail.com",
        clientId: CLIENT_ID,
        clientSecret: CLIENT_SECRET,
        refreshToken: REFRESH_TOKEN,
        accessToken: ACCESS_TOKEN,
      },
    });

    const details = {
      from: "Samarth Jain <spunkysam02@gmail.com>",
      to: useremail,
      subject: "Reset password",
      text: "Hello, This is Samarth Jain",
      html: `To reset your password, OTP is <h1>${otp}</h1></a>`,
    };

    const result = await transport.sendMail(details);
    return result;
  } catch (err) {
    return err;
  }
}
module.exports = mailer;
