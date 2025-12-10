# 🚀 Configuración de Jenkins para React Registro Asistencia

## 📋 Pre-requisitos en Jenkins

### 1. Plugins requeridos
Instalar desde **Manage Jenkins → Plugin Manager**:

```
✅ NodeJS Plugin
✅ Pipeline
✅ Git Plugin
✅ JUnit Plugin
✅ HTML Publisher Plugin
✅ Email Extension Plugin
✅ SonarQube Scanner (opcional)
✅ Slack Notification (opcional)
```

### 2. Configurar NodeJS
**Manage Jenkins → Global Tool Configuration → NodeJS**

```
Name: NodeJS-20
Install automatically: ✅
Version: NodeJS 20.x
```

### 3. Configurar SonarQube (opcional)
**Manage Jenkins → Configure System → SonarQube servers**

```
Name: SonarQube
Server URL: http://localhost:9000
Authentication Token: [tu-token]
```

---

## 🔧 Configuración del Job

### Opción 1: Pipeline desde SCM (recomendado)

1. **New Item → Pipeline**
   - Nombre: `react-registro-asistencia`

2. **Build Triggers**
   ```
   ✅ GitHub hook trigger for GITScm polling
   ✅ Poll SCM (backup): H/5 * * * *
   ```

3. **Pipeline**
   - Definition: `Pipeline script from SCM`
   - SCM: `Git`
   - Repository URL: `https://github.com/alexavilabrito/react-registro-asistencia`
   - Credentials: [tu-credential]
   - Branch: `*/main`
   - Script Path: `Jenkinsfile`

4. **Guardar**

### Opción 2: Multibranch Pipeline

1. **New Item → Multibranch Pipeline**
   - Nombre: `react-registro-asistencia-multibranch`

2. **Branch Sources**
   - Add source: `Git`
   - Repository URL: `https://github.com/alexavilabrito/react-registro-asistencia`
   - Behaviors:
     - Discover branches
     - Discover pull requests from origin

3. **Build Configuration**
   - Mode: `by Jenkinsfile`
   - Script Path: `Jenkinsfile`

4. **Scan Multibranch Pipeline Triggers**
   ```
   ✅ Periodically if not otherwise run
   Interval: 1 hour
   ```

---

## 🔗 Configurar Webhook en GitHub

### En tu repositorio GitHub:

1. **Settings → Webhooks → Add webhook**

2. **Configuración:**
   ```
   Payload URL: http://[tu-jenkins-url]/github-webhook/
   Content type: application/json
   Secret: [opcional]
   
   Which events would you like to trigger this webhook?
   ✅ Just the push event
   ✅ Pull requests
   
   ✅ Active
   ```

3. **Add webhook**

---

## 📊 Stages de la Pipeline

| Stage | Descripción | Fallar Build |
|-------|-------------|--------------|
| **Checkout** | Clonar repositorio | ❌ |
| **Install** | `npm ci` | ✅ |
| **Type Check** | Validar TypeScript | ✅ |
| **Lint** | ESLint | ✅ |
| **Unit Tests** | Vitest + Coverage | ✅ |
| **Build** | Compilar dist/ | ✅ |
| **SonarQube** | Análisis de código | ⚠️ |
| **Quality Gate** | Validar umbrales | ✅ |
| **Deploy Staging** | Solo rama develop | ❌ |
| **Deploy Prod** | Solo rama main (manual) | ❌ |

---

## 🎯 Quality Gates

### Cobertura de Tests (Vitest)
```javascript
lines: 70%
functions: 70%
branches: 70%
statements: 70%
```

### Linting (ESLint)
```
Max Warnings: 0
```

### Type Check (TypeScript)
```
Errors: 0
```

---

## 📧 Notificaciones

### Email
Configurado en `post` del Jenkinsfile:
- ✅ Success → Developers + Requestor
- ❌ Failure → Developers + Requestor
- ⚠️ Unstable → Developers

### Slack (opcional)
Agregar al `post` del Jenkinsfile:

```groovy
post {
    success {
        slackSend(
            channel: '#builds',
            color: 'good',
            message: "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}"
        )
    }
    failure {
        slackSend(
            channel: '#builds',
            color: 'danger',
            message: "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}\n${env.BUILD_URL}"
        )
    }
}
```

---

## 🐳 Alternativa con Docker

Si prefieres usar Docker Agent, usa `Jenkinsfile.docker`:

### Ventajas:
- ✅ Entorno aislado y reproducible
- ✅ No requiere configurar NodeJS en Jenkins
- ✅ Mismo entorno en todos los agents

### Desventajas:
- ❌ Más lento (descarga imagen)
- ❌ Requiere Docker en Jenkins agents

---

## 🔍 Troubleshooting

### Error: "npm: command not found"
**Solución:** Verificar que NodeJS está instalado y configurado en Global Tool Configuration.

### Error: "Permission denied" en npm ci
**Solución:** Agregar `-u root:root` al Docker agent o ajustar permisos.

### Tests no se publican
**Solución:** Verificar que Vitest genera `junit.xml` en `test-results/`.

### Coverage no aparece
**Solución:** Instalar HTML Publisher Plugin y verificar ruta `coverage/index.html`.

---

## 📈 Métricas a monitorear

1. **Build Time:** < 5 minutos ideal
2. **Test Coverage:** > 70%
3. **Success Rate:** > 90%
4. **Time to Feedback:** < 10 minutos

---

## 🚀 Próximos pasos

1. ✅ Configurar Jenkins Job
2. ✅ Conectar GitHub Webhook
3. ✅ Hacer push a main/develop
4. ✅ Verificar pipeline ejecuta correctamente
5. 🔄 Agregar tests unitarios (ver Fase 1 en conversación anterior)
6. 🔄 Configurar SonarQube (opcional)
7. 🔄 Implementar deploy automático

---

## 📚 Referencias

- [Jenkins Pipeline Syntax](https://www.jenkins.io/doc/book/pipeline/syntax/)
- [NodeJS Plugin](https://plugins.jenkins.io/nodejs/)
- [Vitest CI Configuration](https://vitest.dev/guide/ci.html)
- [SonarQube Scanner](https://docs.sonarqube.org/latest/analysis/scan/sonarscanner/)
