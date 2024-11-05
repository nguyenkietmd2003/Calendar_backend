import { Op } from "sequelize"; // Thêm Sequelize// Import sendEmailService
import { sendEmail } from "./sendEmailService.js";
import initModels from "../models/init-models.js";
import { sequelize } from "../config/database.js";

let model = initModels(sequelize);

// Hàm kiểm tra và gửi thông báo
const checkAndSendNotifications = async () => {
  // Lấy thời gian hiện tại ở UTC
  const currentTime = new Date().toISOString();
  console.log(currentTime);

  // Lấy danh sách thông báo chưa gửi và thời gian thông báo đã đến
  const notifications = await model.Notification.findAll({
    where: {
      notification_time: {
        [Op.lte]: currentTime, // So sánh với thời gian hiện tại
      },
      is_sent: false,
    },
  });

  for (const notification of notifications) {
    try {
      const user = await model.User.findOne({
        where: {
          id: notification.user_id,
        },
      });

      if (!user) {
        console.error(`User not found for ID: ${notification.user_id}`);
        continue;
      }

      const userEmail = user.email;
      const subject = "Thông báo lịch làm việc";
      const text = `Nhắc nhở: Bạn có lịch làm việc sắp tới.`;

      await sendEmail(userEmail, subject, text);

      notification.is_sent = true;
      await notification.save();
    } catch (error) {
      console.error(
        `Failed to send email to user ${notification.user_id}:`,
        error
      );
    }
  }
};

setInterval(checkAndSendNotifications, 60000);
export default checkAndSendNotifications;
