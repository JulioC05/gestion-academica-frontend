import { ApplicationInsights } from '@microsoft/applicationinsights-web';

const connectionString = import.meta.env.VITE_APPLICATIONINSIGHTS_CONNECTION_STRING;

const appInsights = new ApplicationInsights({
  config: {
    connectionString: connectionString,
    // Habilita el envío inmediato para pruebas (opcional)
    maxAjaxCallsPerView: 50,
    disableTelemetry: !connectionString // Si no hay variable, deshabilita la telemetría (para que no falle en local si no la configuras)
  }
});

// Solo inicia si la variable existe
if (connectionString) {
  appInsights.loadAppInsights();
  appInsights.trackPageView(); // Registra las visitas automáticamente
  console.log("🟢 Telemetría del Frontend de Azure inicializada");
} else {
  console.log("🟡 Advertencia: No se detectó VITE_APPLICATIONINSIGHTS_CONNECTION_STRING en el entorno local");
}

export { appInsights };