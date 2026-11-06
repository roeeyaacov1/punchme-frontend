/**
 * Whether joining asks for the code from a text. The app's `VITE_OTP_REQUIRED`
 * is off until the SMS account is live; the video, like the landing page,
 * says a customer gives a mobile number and the code from a text. If the
 * code is still off when the video goes out, set this to false: the join's
 * line then says only the mobile number.
 */
export const SMS_CODE = true;

/** Where the video sends people, and where the sample sign's code leads. */
export const SITE_URL = "https://punchmeapp.com/";
