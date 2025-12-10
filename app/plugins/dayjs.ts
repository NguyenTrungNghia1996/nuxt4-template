import dayjs from "dayjs";

// Nếu bạn cần plugin mở rộng thì import ở đây
import relativeTime from "dayjs/plugin/relativeTime";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";

dayjs.extend(relativeTime);
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.tz.setDefault("Asia/Ho_Chi_Minh");
export default defineNuxtPlugin(() => {
  return {
    provide: {
      dayjs,
    },
  };
});
