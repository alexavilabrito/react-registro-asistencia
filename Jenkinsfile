pipeline {
    agent any
    
    // Configuración de Node.js
    tools {
        nodejs 'NodeJS-20' // Nombre configurado en Jenkins Global Tool Configuration
    }
    
    environment {
        // Variables de entorno
        CI = 'true'
        NODE_ENV = 'production'
        SONAR_SCANNER_HOME = tool 'SonarQube Scanner' // Opcional: para análisis de código
    }
    
    options {
        // Configuraciones adicionales
        buildDiscarder(logRotator(numToKeepStr: '10')) // Mantener solo 10 builds
        timeout(time: 30, unit: 'MINUTES') // Timeout de 30 minutos
        timestamps() // Mostrar timestamps en logs
        disableConcurrentBuilds() // Evitar builds concurrentes
    }
    
    stages {
        stage('🔍 Checkout') {
            steps {
                script {
                    echo '📦 Clonando repositorio...'
                    checkout scm
                }
            }
        }
        
        stage('📋 Environment Info') {
            steps {
                script {
                    echo '🔧 Información del entorno:'
                    sh 'node --version'
                    sh 'npm --version'
                    sh 'git --version'
                }
            }
        }
        
        stage('📦 Install Dependencies') {
            steps {
                script {
                    echo '⬇️ Instalando dependencias...'
                    sh 'npm ci' // Más rápido y determinista que npm install
                }
            }
        }
        
        stage('🔎 Type Check') {
            steps {
                script {
                    echo '📝 Validando tipos de TypeScript...'
                    sh 'npm run type-check'
                }
            }
        }
        
        stage('🧹 Lint') {
            steps {
                script {
                    echo '🔍 Ejecutando ESLint...'
                    sh 'npm run lint'
                }
            }
        }
        
        stage('🧪 Unit Tests') {
            steps {
                script {
                    echo '🧪 Ejecutando tests unitarios...'
                    sh 'npm run test:coverage'
                }
            }
            post {
                always {
                    // Publicar resultados de tests
                    junit allowEmptyResults: true, testResults: '**/test-results/**/*.xml'
                    
                    // Publicar reporte de cobertura (HTML)
                    publishHTML([
                        allowMissing: false,
                        alwaysLinkToLastBuild: true,
                        keepAll: true,
                        reportDir: 'coverage',
                        reportFiles: 'index.html',
                        reportName: 'Coverage Report',
                        reportTitles: 'Test Coverage'
                    ])
                }
            }
        }
        
        stage('🏗️ Build') {
            steps {
                script {
                    echo '🔨 Compilando aplicación...'
                    sh 'npm run build'
                }
            }
            post {
                success {
                    // Archivar artefactos del build
                    archiveArtifacts artifacts: 'dist/**/*', fingerprint: true
                }
            }
        }
        
        stage('📊 SonarQube Analysis') {
            when {
                branch 'main' // Solo en rama main
            }
            steps {
                script {
                    echo '📊 Ejecutando análisis de SonarQube...'
                    withSonarQubeEnv('SonarQube') {
                        sh """
                            ${SONAR_SCANNER_HOME}/bin/sonar-scanner \
                            -Dsonar.projectKey=react-registro-asistencia \
                            -Dsonar.sources=src \
                            -Dsonar.tests=src \
                            -Dsonar.test.inclusions=**/*.test.ts,**/*.test.tsx \
                            -Dsonar.javascript.lcov.reportPaths=coverage/lcov.info \
                            -Dsonar.typescript.lcov.reportPaths=coverage/lcov.info
                        """
                    }
                }
            }
        }
        
        stage('✅ Quality Gate') {
            when {
                branch 'main'
            }
            steps {
                script {
                    echo '🚦 Esperando resultado del Quality Gate...'
                    timeout(time: 5, unit: 'MINUTES') {
                        waitForQualityGate abortPipeline: true
                    }
                }
            }
        }
        
        stage('🚀 Deploy to Staging') {
            when {
                branch 'develop'
            }
            steps {
                script {
                    echo '🚀 Desplegando a staging...'
                    // Ejemplo: desplegar a servidor staging
                    sh '''
                        # rsync -avz --delete dist/ user@staging-server:/var/www/app/
                        echo "Deploy a staging deshabilitado por ahora"
                    '''
                }
            }
        }
        
        stage('🚀 Deploy to Production') {
            when {
                branch 'main'
            }
            input {
                message "¿Desplegar a producción?"
                ok "Deploy!"
            }
            steps {
                script {
                    echo '🚀 Desplegando a producción...'
                    // Ejemplo: desplegar a servidor producción
                    sh '''
                        # rsync -avz --delete dist/ user@prod-server:/var/www/app/
                        echo "Deploy a producción deshabilitado por ahora"
                    '''
                }
            }
        }
    }
    
    post {
        always {
            echo '🧹 Limpiando workspace...'
            cleanWs()
        }
        
        success {
            echo '✅ Pipeline ejecutado exitosamente!'
            // Notificación de éxito (Slack, email, etc.)
            emailext (
                subject: "✅ Build SUCCESS: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Exitoso</h2>
                    <p><strong>Proyecto:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build:</strong> #${env.BUILD_NUMBER}</p>
                    <p><strong>Rama:</strong> ${env.GIT_BRANCH}</p>
                    <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                    <p><a href="${env.BUILD_URL}">Ver detalles</a></p>
                """,
                recipientProviders: [developers(), requestor()],
                mimeType: 'text/html'
            )
        }
        
        failure {
            echo '❌ Pipeline falló!'
            // Notificación de fallo
            emailext (
                subject: "❌ Build FAILED: ${env.JOB_NAME} #${env.BUILD_NUMBER}",
                body: """
                    <h2>Build Fallido</h2>
                    <p><strong>Proyecto:</strong> ${env.JOB_NAME}</p>
                    <p><strong>Build:</strong> #${env.BUILD_NUMBER}</p>
                    <p><strong>Rama:</strong> ${env.GIT_BRANCH}</p>
                    <p><strong>Commit:</strong> ${env.GIT_COMMIT}</p>
                    <p><a href="${env.BUILD_URL}console">Ver logs</a></p>
                """,
                recipientProviders: [developers(), requestor()],
                mimeType: 'text/html'
            )
        }
        
        unstable {
            echo '⚠️ Pipeline inestable!'
        }
    }
}
