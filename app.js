// Referencias a elementos del DOM
const carro = document.getElementById('carro');
const btnIniciar = document.getElementById('btnIniciar');
const btnReiniciar = document.getElementById('btnReiniciar');

const txtT12 = document.getElementById('txtT12');
const txtT23 = document.getElementById('txtT23');
const txtV12 = document.getElementById('txtV12');
const txtV23 = document.getElementById('txtV23');
const txtAcel = document.getElementById('txtAcel');

// Referencias a Audio
const musicaFondo = document.getElementById('musicaFondo');
const sonidoMotor = document.getElementById('sonidoMotor');

// Configuración de Volúmenes (0.0 a 1.0)
musicaFondo.volume = 0.25;
sonidoMotor.volume = 0.85;

// Configuración física equivalente
const d12_fisica = 0.35; // Distancia entre Sensor 1 y 2 (m)
const d23_fisica = 0.35; // Distancia entre Sensor 2 y 3 (m)

let animacionId = null;
let corriendo = false;

// Posiciones porcentuales de los sensores en la pista
const posInicio = 2;
const posSensor1 = 20;
const posSensor2 = 55;
const posSensor3 = 85;

let tInicio = 0;
let t1 = null;
let t2 = null;
let t3 = null;

// Evento Iniciar Carrera
btnIniciar.addEventListener('click', () => {
  if (corriendo) return;
  corriendo = true;

  // Iniciar audio
  musicaFondo.play().catch(e => console.log("Permiso de audio requerido:", e));
  sonidoMotor.currentTime = 0;
  sonidoMotor.play();

  const aceleracion = parseFloat(document.getElementById('inputAcel').value) || 1.0;
  const v0 = parseFloat(document.getElementById('inputV0').value) || 0.0;

  t1 = null;
  t2 = null;
  t3 = null;
  
  tInicio = performance.now();

  function animar(tiempoActual) {
    const t = (tiempoActual - tInicio) / 1000; // Convertir a segundos

    // Ecuación MRUV: x = v0*t + 0.5*a*t^2
    const desplazamientoPixel = (v0 * t + 0.5 * aceleracion * Math.pow(t, 2)) * 18;
    const posActual = posInicio + desplazamientoPixel;

    carro.style.left = `${Math.min(posActual, 88)}%`;

    // Detección en los sensores
    if (posActual >= posSensor1 && t1 === null) t1 = t;
    if (posActual >= posSensor2 && t2 === null) t2 = t;
    if (posActual >= posSensor3 && t3 === null) {
      t3 = t;
      procesarDatos();
      corriendo = false;
      return;
    }

    if (posActual < 88) {
      animacionId = requestAnimationFrame(animar);
    } else {
      corriendo = false;
    }
  }

  animacionId = requestAnimationFrame(animar);
});

// Función de procesamiento cinemático
function procesarDatos() {
  const dt12 = t2 - t1;
  const dt23 = t3 - t2;

  const v12 = d12_fisica / dt12;
  const v23 = d23_fisica / dt23;

  const deltaT = (dt12 + dt23) / 2;
  const aceleracionExp = (v23 - v12) / deltaT;

  txtT12.innerText = dt12.toFixed(4) + " s";
  txtT23.innerText = dt23.toFixed(4) + " s";
  txtV12.innerText = v12.toFixed(2) + " m/s";
  txtV23.innerText = v23.toFixed(2) + " m/s";
  txtAcel.innerText = aceleracionExp.toFixed(2) + " m/s²";
}

// Evento Reiniciar
btnReiniciar.addEventListener('click', () => {
  cancelAnimationFrame(animacionId);
  corriendo = false;
  carro.style.left = `${posInicio}%`;

  // Detener sonido de motor
  sonidoMotor.pause();
  sonidoMotor.currentTime = 0;

  txtT12.innerText = "0.0000 s";
  txtT23.innerText = "0.0000 s";
  txtV12.innerText = "0.00 m/s";
  txtV23.innerText = "0.00 m/s";
  txtAcel.innerText = "0.00 m/s²";
});