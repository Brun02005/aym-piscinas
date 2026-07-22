-- =========================================================
-- A&M PISCINAS — Datos iniciales (seed)
-- CÓMO USAR: correr DESPUÉS de schema.sql, en el SQL Editor.
-- Carga el mismo contenido que hoy está en la web (modelos PlastCar reales +
-- bocetos de gama alta/baja, obras, testimonios y FAQ de ejemplo).
-- =========================================================

-- ---------- MODELOS ----------
insert into modelos (id, nombre, gama, linea, marca, largo, ancho, profundidad, capacidad_litros, solarium, escalones, material, precio_base, es_boceto, orden) values
('hz-inf80','Infinity 800','alta','Infinity','Hormigón a medida',8.00,3.80,1.60,42000,'2.00 x 1.20 m',4,'Hormigón proyectado + revestimiento de gresite',24000,true,1),
('hz-inf1000','Infinity 1000','alta','Infinity','Hormigón a medida',10.00,4.20,1.80,62000,'2.40 x 1.20 m',4,'Hormigón proyectado + revestimiento de gresite',34000,true,2),
('hz-sk700','Skimmer 700','alta','Skimmer premium','Hormigón a medida',7.00,3.50,1.50,32000,'1.80 x 1.00 m',4,'Hormigón proyectado + microcemento',19500,true,3),
('hz-sk900','Skimmer 900','alta','Skimmer premium','Hormigón a medida',9.00,4.00,1.70,52000,'2.20 x 1.20 m',4,'Hormigón proyectado + microcemento',27500,true,4),
('x300','X300','media','Exclusivo','PlastCar',3.00,2.00,1.20,3500,'No aplica',3,'Fibra de vidrio reforzada',4200,false,5),
('m400','M400','media','Solarium Mix','PlastCar',4.00,2.30,1.40,8000,'1.40 m',4,'Fibra de vidrio reforzada',5600,false,6),
('m465','M465','media','Solarium Mix','PlastCar',4.65,2.60,1.40,11000,'1.25 x 0.75 m',4,'Fibra de vidrio reforzada',6400,false,7),
('m580','M580','media','Solarium Mix','PlastCar',5.80,2.80,1.40,16000,'1.45 x 1.00 m',4,'Fibra de vidrio reforzada',7800,false,8),
('m710','M710','media','Solarium Mix','PlastCar',7.10,3.20,1.40,24000,'1.70 x 1.00 m',4,'Fibra de vidrio reforzada',10200,false,9),
('s460','S460','media','Solarium M','PlastCar',4.60,2.50,1.40,10000,'60 cm',3,'Fibra de vidrio reforzada',6100,false,10),
('s530','S530','media','Solarium M','PlastCar',5.30,2.70,1.40,14000,'60 cm',3,'Fibra de vidrio reforzada',7200,false,11),
('s601','S601','media','Solarium M','PlastCar',6.00,3.10,1.40,18000,'80 cm',3,'Fibra de vidrio reforzada',8500,false,12),
('s701','S701','media','Solarium L','PlastCar',7.00,3.10,1.40,23000,'80 cm',3,'Fibra de vidrio reforzada',9900,false,13),
('s750','S750','media','Solarium L','PlastCar',7.50,3.25,1.40,25000,'80 cm',3,'Fibra de vidrio reforzada',10600,false,14),
('s650','S650','media','Solarium XL','PlastCar',6.50,3.10,1.40,22000,'1.00 m',3,'Fibra de vidrio reforzada',9400,false,15),
('s702','S702','media','Solarium XL','PlastCar',7.00,3.10,1.40,23000,'1.00 m',3,'Fibra de vidrio reforzada',10100,false,16),
('s800','S800','media','Solarium XL','PlastCar',8.00,3.40,1.40,27000,'1.00 m',3,'Fibra de vidrio reforzada',11800,false,17),
('s950','S950','media','Solarium XL','PlastCar',9.50,3.50,1.40,36000,'1.00 m',3,'Fibra de vidrio reforzada',14200,false,18),
('r602','R602','media','Rectas','PlastCar',6.00,3.10,1.40,18000,'No aplica',4,'Fibra de vidrio reforzada',8100,false,19),
('r700','R700','media','Rectas','PlastCar',7.00,3.25,1.40,22000,'No aplica',4,'Fibra de vidrio reforzada',9300,false,20),
('cp-250','Compacta 250','baja','Compactas','Proveedor a definir',2.50,1.80,1.10,2600,'No aplica',2,'Fibra de vidrio',2400,true,21),
('cp-320','Compacta 320','baja','Compactas','Proveedor a definir',3.20,2.10,1.20,4000,'No aplica',3,'Fibra de vidrio',3100,true,22),
('pf-400','Prefabricada 400','baja','Prefabricadas','Proveedor a definir',4.00,2.20,1.20,6000,'No aplica',3,'Panel de acero + liner reforzado',3800,true,23),
('pf-500','Prefabricada 500','baja','Prefabricadas','Proveedor a definir',5.00,2.50,1.30,9500,'No aplica',3,'Panel de acero + liner reforzado',4700,true,24)
on conflict (id) do nothing;

-- ---------- OBRAS (ejemplo, reemplazar por reales) ----------
insert into obras (titulo, modelo, localidad, orden) values
('Piscina familiar con deck','Solarium XL · 8,00 m','Villa Allende, Córdoba',1),
('Fondo de jardín con cascada','Solarium L · 7,00 m','Córdoba Capital',2),
('Piscina compacta en patio urbano','Exclusivo · 3,00 m','Nueva Córdoba',3),
('Gama alta con borde infinito','Infinity · 10,00 m','Mendiolaza',4),
('Solárium amplio para toda la familia','Solarium XL · 9,50 m','Río Ceballos',5),
('Piscina de fibra lista en una semana','Solarium Mix · 5,80 m','Jesús María',6);

-- ---------- TESTIMONIOS (ejemplo, reemplazar por reales) ----------
insert into testimonios (texto, nombre, localidad, estrellas, orden) values
('El configurador nos ayudó a decidir sin presión. Llegamos a la visita técnica ya sabiendo qué queríamos.','Familia López','Villa Allende',5,1),
('Impecables de principio a fin. La piscina quedó tal cual la habíamos armado en la web.','Marina G.','Córdoba Capital',5,2),
('Nos pasaron el presupuesto al instante por WhatsApp y coordinamos la obra en pocos días.','Diego y Sol','Mendiolaza',5,3);

-- ---------- FAQ (referencia, ajustar con info oficial) ----------
insert into faq (pregunta, respuesta, orden) values
('¿Cuánto tarda la instalación de una piscina?','<p>Depende del tipo de piscina. Una piscina de fibra de vidrio puede estar instalada en <b>5 a 10 días hábiles</b> desde que arranca la obra. Las piscinas de hormigón proyectado (gama alta) llevan entre <b>30 y 60 días</b> según el tamaño y las terminaciones.</p><p>En la visita técnica te damos un cronograma detallado.</p>',1),
('¿Necesito algún permiso municipal para instalar una piscina?','<p>En la mayoría de los municipios de Córdoba <b>sí se requiere un permiso de obra</b> o al menos una habilitación para excavación. Los requisitos varían según la localidad.</p><p>Nosotros te orientamos con los trámites y, si hace falta, coordinamos con un profesional matriculado para la presentación.</p>',2),
('¿Qué mantenimiento requiere la piscina?','<p>El mantenimiento básico incluye:</p><p>• <b>Filtrado</b>: correr el filtro entre 6 y 8 horas diarias en temporada.</p><p>• <b>Químicos</b>: controlar el cloro y el pH semanalmente.</p><p>• <b>Limpieza</b>: barrer el fondo y limpiar el skimmer una vez por semana.</p><p>Te entregamos una guía de mantenimiento con la piscina y te acompañamos en la puesta en marcha.</p>',3),
('¿Qué incluye el precio que se muestra en la web?','<p>El precio que ves es <b>orientativo</b> e incluye la piscina (con el modelo y las terminaciones elegidas) y el equipo de filtrado básico. La instalación (excavación, relleno, conexiones) se cotiza según el terreno en la visita técnica.</p><p>En la gama alta, el precio incluye además el proyecto de obra y la construcción en hormigón.</p>',4),
('¿Tienen garantía las piscinas?','<p>Sí. Las piscinas de fibra de vidrio tienen <b>garantía del fabricante</b> que varía según la marca (generalmente entre 5 y 10 años sobre la estructura). Las piscinas de hormigón tienen garantía sobre la obra.</p><p>En la visita técnica te detallamos la garantía específica del modelo que elijas.</p>',5),
('¿Puedo financiar la compra?','<p>Sí, trabajamos con <b>planes de pago en cuotas</b>. Las condiciones dependen del modelo y el momento, así que lo mejor es consultarnos directamente por WhatsApp o en la visita técnica para que te pasemos las opciones vigentes.</p>',6),
('¿La visita técnica tiene algún costo?','<p><b>No, la visita técnica es sin cargo y sin compromiso.</b> Un asesor va a tu domicilio, mide el terreno, evalúa el acceso para la maquinaria y te confirma el presupuesto final con la instalación incluida.</p>',7),
('¿Qué pasa si mi terreno tiene desnivel o poco acceso?','<p>No es problema. En la visita técnica evaluamos las condiciones del terreno (desnivel, tipo de suelo, acceso para excavadora). Si hay particularidades, ajustamos el presupuesto y te lo informamos antes de arrancar.</p>',8);
