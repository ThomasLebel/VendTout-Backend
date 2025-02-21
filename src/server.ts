import app from "./app";
import { connectDatabase } from "./models/connection";

const startServer = async () => {
  try {
    await connectDatabase();
    const PORT = process.env.PORT || 3001;
    app.listen(PORT, (): void => {
      console.log(`✅ Serveur démarré sur http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

startServer();
