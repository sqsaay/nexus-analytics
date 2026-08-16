import app from './app';
import { env } from './config/env';
import { logger } from './utils/logger';

const PORT = Number(env.PORT) || 5000;

app.listen(PORT, () => {
  logger.info(`🚀 NexusAnalytics Server listening on http://localhost:${PORT}`);
  logger.info(`📚 OpenAPI Documentation available at http://localhost:${PORT}/api-docs`);
  logger.info(`💚 Health endpoint live at http://localhost:${PORT}/health`);
});
