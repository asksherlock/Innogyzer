import { motion } from 'framer-motion';
import { useEffect } from 'react';

const PrivacyPolicy = () => {
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="relative z-10 min-h-screen pt-40 pb-32">
      <div className="container mx-auto px-6 max-w-4xl relative z-10">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass-panel p-8 md:p-16 rounded-3xl border border-white/10 text-left"
        >
          <h1 className="text-3xl md:text-5xl font-bold mb-6 text-gradient-animate tracking-tighter">
            Aviso de Privacidad
          </h1>
          <p className="text-white/60 mb-12 text-sm">
            Fecha de última actualización: 23 de septiembre de 2025
          </p>

          <div className="space-y-8 text-white/80 leading-relaxed">
            <p>
              Este aviso aplica a los sitios, micrositios, formularios, chatbots y canales digitales de Innogyzer Innovation Consulting Group S.A.S. de C.V. (en lo sucesivo, “Innogyzer”, “nosotros” o “la Empresa”).
            </p>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">1) Identidad y domicilio del responsable</h2>
              <p><strong>Responsable:</strong> Innogyzer Innovation Consulting Group, Sociedad por Acciones Simplificada de Capital Variable.</p>
              <p><strong>RFC:</strong> IIC170616HI0</p>
              <p><strong>Domicilio:</strong> Calle Santorini #9, Col. Ex-Hacienda Mayorazgo, Puebla, Puebla, C.P. 72480, México.</p>
              <div className="mt-2">
                <p><strong>Contacto de privacidad:</strong></p>
                <p>Correo: contacto@innogyzer.com</p>
                <p>Teléfono/WhatsApp: +52 55 3439 3708</p>
              </div>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">2) Datos personales que recabamos</h2>
              <p className="mb-2">Podemos obtener, directa o indirectamente, los siguientes datos personales:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li><strong>Identificación y contacto:</strong> nombre, correo electrónico, teléfono, empresa, cargo, país/ciudad.</li>
                <li><strong>Profesionales/comerciales:</strong> giro, tamaño de empresa, intereses, historial de interacción con Innogyzer.</li>
                <li><strong>De navegación/tecnología:</strong> IP, identificadores de dispositivo, cookies y píxeles, páginas visitadas, tiempo de permanencia, origen del tráfico, UTM.</li>
                <li><strong>Transaccionales:</strong> información de facturación y pagos [no almacenamos datos completos de tarjetas; los procesa un tercero certificado cuando aplique].</li>
                <li><strong>Audiovisuales/sonoros:</strong> grabaciones voluntarias en webinars, eventos o reuniones virtuales.</li>
              </ul>
              <p className="mt-4"><strong>Datos sensibles:</strong> Innogyzer no solicita datos personales sensibles. Si por cualquier causa nos los proporcionas, los trataremos con medidas reforzadas y procuraremos su supresión cuando no sea indispensable.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">3) Finalidades del tratamiento</h2>
              <p className="font-bold mb-2">Finalidades primarias (necesarias):</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Gestionar tu relación con Innogyzer: registro a webinars/cursos, envío de accesos y certificados, seguimiento de solicitudes y proyectos.</li>
                <li>Atención comercial y soporte: cotizaciones, propuestas, implementación y mejora de servicios.</li>
                <li>Cumplimiento de obligaciones contractuales, fiscales, contables y regulatorias.</li>
                <li>Seguridad y prevención de fraude.</li>
              </ul>
              <p className="font-bold mb-2">Finalidades secundarias (opcionales):</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Marketing, remarketing y analítica: newsletters, contenidos, invitaciones a eventos, encuestas de satisfacción y segmentación publicitaria.</li>
                <li>Elaboración de casos de éxito y testimonios (previa autorización específica).</li>
              </ul>
              <p>Si no deseas que tus datos se utilicen para finalidades secundarias, puedes manifestar tu negativa desde ahora enviando un correo a contacto@innogyzer.com con el asunto “Negativa finalidades secundarias” y tu nombre completo.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">4) Fundamento legal y consentimiento</h2>
              <p>
                El tratamiento se realiza conforme a la Ley Federal de Protección de Datos Personales en Posesión de los Particulares (México) y demás normatividad aplicable. El consentimiento se obtiene al proporcionar tus datos por medios físicos o digitales, participar en nuestros formularios, o continuar navegando tras ser informado sobre el uso de cookies. Cuando sea requerido, solicitaremos tu consentimiento expreso.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">5) Transferencias y encargados</h2>
              <p className="mb-2">Podemos transferir o remitir datos a:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Proveedores que actúan como encargados (p. ej., plataformas de email marketing, CRM, pasarelas de pago, herramientas de videoconferencia, analítica y almacenamiento en la nube), con quienes tenemos acuerdos de confidencialidad y protección de datos.</li>
                <li>Autoridades competentes, cuando lo exija la ley o un requerimiento fundado.</li>
                <li>Clientes o aliados sólo cuando sea necesario para ejecutar un proyecto y cuentes con aviso/consentimiento previo.</li>
              </ul>
              <p>Algunas transferencias pueden implicar transferencias internacionales. En estos casos, verificamos que los receptores mantengan estándares adecuados de protección de datos.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">6) Cookies y tecnologías similares</h2>
              <p className="mb-2">Usamos cookies, web beacons, píxeles y UTM para:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Recordar preferencias y mejorar tu experiencia.</li>
                <li>Medir desempeño de campañas, fuentes de tráfico y acciones de conversión.</li>
                <li>Personalizar contenidos y publicidad.</li>
              </ul>
              <p>Puedes administrar o deshabilitar cookies desde la configuración de tu navegador. Al continuar navegando nuestros sitios después de desplegar el aviso de cookies, consientes su uso.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">7) Derechos ARCO y otros derechos</h2>
              <p className="mb-4">
                Tienes derecho a Acceder, Rectificar, Cancelar u Oponerte (derechos ARCO) al tratamiento de tus datos, así como a revocar tu consentimiento y limitar su uso o divulgación.
              </p>
              <p className="font-bold mb-2">Medios para ejercerlos: envía una solicitud a contacto@innogyzer.com con:</p>
              <ul className="list-disc pl-6 space-y-2 mb-4">
                <li>Nombre completo y medio para comunicarte (correo y/o teléfono).</li>
                <li>Documento que acredite tu identidad o, en su caso, representación legal.</li>
                <li>Descripción clara del derecho que deseas ejercer y los datos involucrados.</li>
                <li>Documentos o información adicional que facilite la localización de los datos.</li>
              </ul>
              <p className="mb-2">
                <strong>Plazos de respuesta:</strong> Te responderemos en un máximo de 20 días hábiles; si resulta procedente, se hará efectivo dentro de los 15 días hábiles siguientes. Los plazos podrán ampliarse en términos de la ley. La revocación no tendrá efectos retroactivos y podría implicar que no podamos seguir prestando ciertos servicios.
              </p>
              <p>Puedes también inscribirte en el Registro Público para Evitar Publicidad (REPEP) de la PROFECO para limitar publicidad.</p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">8) Conservación y seguridad</h2>
              <p>
                Conservaremos tus datos por el tiempo necesario para cumplir las finalidades y obligaciones aplicables, considerando plazos legales y prescripción. Implementamos medidas administrativas, técnicas y físicas razonables para proteger tu información contra daño, pérdida, alteración, destrucción o uso no autorizado.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">9) Tratamiento de datos de menores</h2>
              <p>
                Nuestros servicios se dirigen a mayores de edad. Si identificamos datos de menores, los eliminaremos razonablemente pronto, salvo autorización del padre, madre o tutor.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">10) Cambios al Aviso de Privacidad</h2>
              <p>
                Podremos actualizar este Aviso para reflejar cambios en nuestros procesos o requisitos legales. Las modificaciones se publicarán en nuestro sitio web y entrarán en vigor a partir de su publicación, indicando la fecha de última actualización.
              </p>
            </section>

            <section>
              <h2 className="text-2xl font-bold mb-4 text-white">11) Mecanismos de contacto y quejas</h2>
              <p>
                Para cualquier duda, solicitud ARCO o queja relacionada con la protección de datos, contáctanos en contacto@innogyzer.com o al +52 55 3439 3708. Si consideras que tu derecho a la protección de datos ha sido vulnerado, puedes acudir al INAI (México).
              </p>
            </section>

            <div className="mt-16 pt-8 border-t border-white/10 text-sm text-white/50 text-center space-y-4">
              <p>2026 © Innogyzer® The AI Sprint Agency.</p>
              <p>
                Innogyzer Innovation Consulting Group S.A.S. de C.V. es responsable del tratamiento de tus datos para gestionar servicios y comunicaciones. Para finalidades de marketing puedes negar tu consentimiento escribiendo a contacto@innogyzer.com. Puedes ejercer tus derechos ARCO y conocer el Aviso completo en este sitio.
              </p>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default PrivacyPolicy;
