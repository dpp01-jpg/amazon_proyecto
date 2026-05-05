-- MariaDB dump 10.19  Distrib 10.4.32-MariaDB, for Win64 (AMD64)
--
-- Host: localhost    Database: amazon_db
-- ------------------------------------------------------
-- Server version	10.4.32-MariaDB

/*!40101 SET @OLD_CHARACTER_SET_CLIENT=@@CHARACTER_SET_CLIENT */;
/*!40101 SET @OLD_CHARACTER_SET_RESULTS=@@CHARACTER_SET_RESULTS */;
/*!40101 SET @OLD_COLLATION_CONNECTION=@@COLLATION_CONNECTION */;
/*!40101 SET NAMES utf8mb4 */;
/*!40103 SET @OLD_TIME_ZONE=@@TIME_ZONE */;
/*!40103 SET TIME_ZONE='+00:00' */;
/*!40014 SET @OLD_UNIQUE_CHECKS=@@UNIQUE_CHECKS, UNIQUE_CHECKS=0 */;
/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;
/*!40111 SET @OLD_SQL_NOTES=@@SQL_NOTES, SQL_NOTES=0 */;

--
-- Table structure for table `carrito`
--

DROP TABLE IF EXISTS `carrito`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carrito` (
  `id_usuario` int(11) NOT NULL,
  `id_producto` int(11) NOT NULL,
  `cantidad` int(11) NOT NULL DEFAULT 1,
  PRIMARY KEY (`id_usuario`,`id_producto`),
  KEY `id_producto` (`id_producto`),
  CONSTRAINT `carrito_ibfk_1` FOREIGN KEY (`id_usuario`) REFERENCES `usuarios` (`id`) ON DELETE CASCADE,
  CONSTRAINT `carrito_ibfk_2` FOREIGN KEY (`id_producto`) REFERENCES `productos` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrito`
--

LOCK TABLES `carrito` WRITE;
/*!40000 ALTER TABLE `carrito` DISABLE KEYS */;
INSERT INTO `carrito` VALUES (7,3,2);
/*!40000 ALTER TABLE `carrito` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `carrusel`
--

DROP TABLE IF EXISTS `carrusel`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `carrusel` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `image_url` varchar(255) NOT NULL,
  `alt_text` varchar(255) DEFAULT 'Publicidad',
  `orden` int(11) DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=5 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `carrusel`
--

LOCK TABLES `carrusel` WRITE;
/*!40000 ALTER TABLE `carrusel` DISABLE KEYS */;
INSERT INTO `carrusel` VALUES (1,'imagenes/img/imagen_1.jpg','Banner Especial 1',1),(2,'imagenes/img/imagen_2.jpg','Banner Especial 2',2),(4,'imagenes/img/imagenc1_.jpg','Prueba',0);
/*!40000 ALTER TABLE `carrusel` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `categorias`
--

DROP TABLE IF EXISTS `categorias`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `categorias` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `nombre` varchar(100) NOT NULL,
  `layout_type` varchar(20) DEFAULT 'grid4',
  `link_text` varchar(100) DEFAULT 'Ver más',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `categorias`
--

LOCK TABLES `categorias` WRITE;
/*!40000 ALTER TABLE `categorias` DISABLE KEYS */;
INSERT INTO `categorias` VALUES (1,'Oferta Top','grid4','Ver todas las ofertas'),(2,'Informática','single','Descubre más'),(3,'Electrónica','grid2','Explorar dispositivos');
/*!40000 ALTER TABLE `categorias` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `productos`
--

DROP TABLE IF EXISTS `productos`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `productos` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `title` varchar(255) NOT NULL,
  `price` decimal(10,2) NOT NULL,
  `image` varchar(255) NOT NULL,
  `description` text DEFAULT NULL,
  `id_categoria` int(11) DEFAULT NULL,
  `detalles` text DEFAULT NULL,
  `promo_percent` int(11) DEFAULT NULL,
  `promo_text` varchar(100) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `id_categoria` (`id_categoria`),
  CONSTRAINT `productos_ibfk_1` FOREIGN KEY (`id_categoria`) REFERENCES `categorias` (`id`)
) ENGINE=InnoDB AUTO_INCREMENT=12 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `productos`
--

LOCK TABLES `productos` WRITE;
/*!40000 ALTER TABLE `productos` DISABLE KEYS */;
INSERT INTO `productos` VALUES (1,'Tarjeta gráfica ZOTAC Gaming GeForce RTX 3090',1689.99,'https://m.media-amazon.com/images/I/61o+5ytOVcL._AC_SX679_.jpg','Núcleos de seguimiento de rayos de segunda generación. NVIDIA NVLink (SLI-Ready), VR Ready.\nNúcleos de tensor de tercera generación. Placa frontal de metal y placa trasera LED RGB\nIluminación RGB Spectra 2.0.\nRefrigeración avanzada IceStorm 2.0\nControl activo del ventilador con parada de ventilador Freeze',1,'Los precios de los productos vendidos en Amazon incluyen el IVA. Dependiendo de tu dirección de entrega, el IVA puede variar al finalizar la compra. Para obtener más información, haz clic aqui.\nCoprocesador de gráficos	NVIDIA GeForce RTX 3090\nMarca	ZOTAC\nTamaño de la RAM de gráficos	24 GB\nInterfaz de salida de vídeo	DisplayPort, HDMI\nFabricante del procesador de gráficos	ZOTAC\nTipo de RAM de gráficos	GDDR6X\nUsos recomendados para el producto	Videojuegos\nComponentes incluidos	2 adaptadores dobles de 6 pines a 8 pines, Manual de usuario, Manual de usuario (idioma español, ZOTAC Tarjeta gráfica GAMING GeForce RTX 3090 Trinity OC2 adaptadores dobles de 6 pines a 8 pines, Manual de usuario, Manual de usuario… Ver más\nDispositivos compatibles	Ordenador de escritorio\nInterfaz de tarjeta de gráficos	PCI Express',99,'Oferta ULTRA'),(2,'Producto Oferta 2',29.99,'imagenes/img/01.OfertaTop/imagen_4.jpg','Producto de oferta destacada',1,NULL,29,'Oferta de primavera'),(3,'Dispositivo Amazon 1Thomson MIC300TT ',155.99,'https://m.media-amazon.com/images/I/51ABMMWRUNL._AC_SX679_.jpg','\nMarca	THOMSON\nTecnología de conectividad	Bluetooth\nColor	Roble claro\nTipo de altavoz	Estéreo\nDimensiones del producto: largo x ancho x alto	40 x 30 x 40 centímetros\nFuente de alimentación	Cable eléctrico\nDispositivos compatibles	Altavoz, Smartphone, Tableta, Ordenador personal, Auriculares, Reproductor de MP3\nEstilo	Vintage con elementos contemporáneos\nPeso del producto	4459 Gramos\nVataje	50 vatios',3,'Equipo estéreo inalámbrico THOMSON con sonido de alta fidelidad: 2 velocidades, transmisión por correa. La aguja magnética móvil reproduce todos los discos de 33 y 45 de forma inalámbrica a través de bluetooth 5.0.\nGran conectividad: La función bluetooth inalámbrica permite reproducir música desde un dispositivo externo, como un teléfono móvil, un ordenador portátil u otro dispositivo bluetooth. Incluye reproductor de CD, toma USB y AUX-IN.\nEl equipo estéreo MIC300TT de THOMSON incorpora un sintonizador de radio FM con 50 presintonías, ecualizador y toma USB para cargar (5V-1A).\nPodrás disfrutar de tus vinilos con la aguja de gran calidad técnica incluida y de los 60W de potencia musical total.\nEl MIC300TT de THOMSON incluye una funda guardapolvos para el giradiscos y',NULL,NULL),(4,'Microsoft Surface Laptop | Copilot+ PC |Pantalla táctil 15”| Snapdragon® X Elite | 16GB RAM | 1TB SSD |Último Modelo, 7a edición | Negro',1599.00,'https://m.media-amazon.com/images/I/51T9X6OH3vL._AC_SX679_.jpg','Copilot+ PC: una nueva era de IA; el dispositivo Surface más rápido e inteligente de la historia\nBuen rendimiento: más rápido que MacBook Air M3, con un poder sin iguales para disfrutar de una productividad y creatividad simplificadas; la velocidad ultrarrápida de la NPU permite aplicaciones con tecnología de IA\nTu compañero de IA, acelerado: Busca lo que necesites en lenguaje natural, ya sea que lo hayas visto, enviado o guardado en cualquier plataforma, y deja que Recall (Recuerdos) lo encuentre al instante\nMicrosoft Copilot: conviértete en creador con un solo clic; presiona la tecla de Microsoft Copilot en Surface Laptop y transforma tus ideas en realidad\nPantalla brillante: increíblemente brillante con tecnología HDR mejorada, ofrece blancos más nítidos, negros más oscuros y un espectro de colores ampliado\nCámara Surface Studio mejorada por IA: captura, escanea, inicia una llamada; con cámaras HD frontales y traseras, y características mejoradas por IA para lograr la iluminación adecuada y un sonido ultranítido, llames de donde llames\nInteligentemente moderno: Diseñado con aluminio ligero, pero resistente, en los colores platino y negro',2,'\nMarca	Microsoft\nNombre del modelo	Surface Laptop\nTamaño de pantalla	15 Pulgadas\nColor	Negro\nTamaño del disco duro	1 TB\nModelo de CPU	Snapdragon\nTamaño de memoria RAM instalada	16 GB\nSistema operativo	Windows 11 Home\nFunción especial	Funciones basadas en IA\nDescripción de la tarjeta gráfica	Integrated',55,'Oferta Flash'),(6,'Hisense HS622E10X',269.99,'https://m.media-amazon.com/images/I/71lpOhJR9jL._AC_SX679_.jpg','\nMarca	Hisense\nTipo de instalación	Portátil\" or \"No requiere instalación\nDimensiones del producto	60f. x 60an. x 84,6al. centímetros\nCapacidad	11 Litros\nFunción especial	Partial AquaStop\nColor	Inox\nTipo de controles	Pulsador\nMaterial	Acero inoxidable\nNivel de ruido	47 Decibelios\nComponentes incluidos	Cable de alimentación',1,'13 Servicios - Amplitud de 60Cm\nCon tan solo 47 dB, este lavavajillas Hisense es muy silencioso para poder utilizarlo incluso por la noche\nDispone de inicio diferido y Lavado Rápido 30\'\nPosibilidad de 1/2 Carga\nEficiente clase E con programa ECO\nALxANxPROF: 85x60x60cm',29,'Oferta Flash'),(7,'ghd Gold - Plancha de Pelo Profesional Para un Cabello Liso y Brillante - Para Todo Tipo de Cabello - Color Negro, (Enchufe Europeo)',160.00,'https://m.media-amazon.com/images/I/71leadKIJ6L._SX522_.jpg','Plancha de pelo profesional óptima para pelo largo, corto o media melena; permite crear looks lisos, ondas y rizos\nTecnología de calor dual-zone: esta plancha de pelo ghd incorpora dos sensores (uno por placa) que proporcionan una temperatura óptima de peinado de 185ºC de raíces a puntas\nLa styler ghd Gold incorpora placas contorneadas y basculantes: consigue un peinado más rápido, sin encrespamiento y con más brillo\nLleva tu plancha ghd a cualquier parte del mundo gracias a su voltaje universal',1,'\nBeneficios	Alisado\nMarca	ghd\nNombre Modelo	gold\nTipo de cabello resultante	Recto\nFabricante	Ghd\nNúm. de identificación comercial global	05060777122850\nTipo de cabello	Todos los tipos\nNúmero Modelo	99350169183\nNúmero de pieza del fabricante	99350085260\nComponentes incluidos	1 product\nTotal del paquete según la medida elegida para referenciar precio	1 Conteo\nPaís de origen	China\nClasificación en los más vendidos de Amazon	\nnº102 en Belleza (Ver el Top 100 en Belleza)\nnº1 en Planchas para el pelo\nASIN	B0CCYPDLCQ\nValoración media de los clientes	4,5 4,5 de 5 estrellas   (18.937)\n4,5 de 5 estrellas',19,'Oferta Flash'),(8,'Optimum Nutrition Creatina Micronizada en Polvo, Sin Sabor, 634g, 186 Servicios',30.00,'https://m.media-amazon.com/images/I/71yeLl-1W4L._AC_SX679_.jpg','\nMarca	Optimum Nutrition\nSabor	Sin sabor\nTipo de complemento principal	Creatina\nNúmero de unidades	634.0 Gramos\nForma del producto	Polvo\nPeso del producto	634 Gramos\nDimensiones del producto: largo x ancho x alto	10,4 x 10,4 x 17,5 centímetros\nIngredientes especiales	Creatina\nVentajas del producto	Crecimiento muscular\nRango de edad (descripción)	Adulto',1,'Creatina en polvo micronizada de Optimum Nutrition, la marca de nutrición deportiva n.° 1 del mundo**: ofrece la más alta calidad en productos de recuperación y energía antes y después del entrenamiento y nutrición deportiva para cualquier momento\nEste polvo de monohidrato de creatina 100 % pura aumenta el rendimiento físico* durante el entrenamiento de alta intensidad y proporciona 3 g de creatina por porción\nDiseñado como suplemento pre y post entrenamiento, es excelente antes y después del entrenamiento de CrossFit, sesiones de pista y gimnasio de alta intensidad, tanto para aficionados como para profesionales\nSin sabor, perfecto para apilar, este polvo se mezcla fácilmente y, a diferencia de muchos otros polvos de creatina, no tiene sabor ni textura arenosa\nPara un delicioso batido agrega una medida rasa a 240 ml de agua fría, un zumo o tu batido pre o post entrenamiento, mezcla y disfruta\n*La creatina aumenta el rendimiento físico en ráfagas sucesivas de ejercicio de corta duración y alta intensidad. Fuente: REGLAMENTO DE LA COMISIÓN (UE) Nº 432/2012 de 16 de mayo de 2012\n**Fuente: Euromonitor International Limited; Consumer Health Edición 2023, categoría Sports Protein Powder, % DE PARTICIPACIÓN DE VALOR MINORISTA, DATOS DE 2022',20,'Oferta Flash'),(9,'Producto Oferta 1',50.00,'imagenes/img/01.OfertaTop/imagen_3.jpg','Producto de oferta destacada DOO',1,'Marca: Amazon\nCLEANYOURSELF: dd',35,'Oferta flash'),(11,'JSVER Regleta Enchufes USB, Proteccion Sobretension con 8 Toma de Corriente y 4 Puertos(5V3,4A) Estación de Carga Inteligente Tomas Alargadora con Cable 1.8m-Negro',19.99,'https://m.media-amazon.com/images/I/61dgRlVnOZL._AC_SX522_.jpg','Regleta 12 en 1: la regleta con 8 salidas de CA, 3 puertos USB-A y un puerto USB-C le permiten cargar simultáneamente varios dispositivos, ofreciendo el máximo nivel de seguridad, conveniencia y confiabilidad.\nCarga de alta velocidad: la tecnología avanzada garantiza una carga eficiente mediante la distribución óptima de la corriente. Salida total: 5V / 3.4A, 17W.\nProtección total: con una clasificación de protección contra sobretensiones de 1,050 julios, un interruptor de sobrecarga de 16 A con tecnología de apagado automático y tomacorrientes con conexión a tierra (tres clavijas), esta regleta es lo último en protección contra picos de voltaje y sobrecargas de circuitos.\nSólido y duradero: la carcasa ignífuga y el bronce fosforoso se combinan para durar mucho tiempo. El diseño cuboide de borde redondeado proporciona una apariencia más limpia.',3,'\nMarca	JSVER\nColor	Negra-8 tomas\nTotal de tomas de corriente	8\nTensión	230 Voltios\nFunción especial	Protección contra sobretensiones\nDimensiones del producto	25,2l. x 11an. centímetros\nUsos recomendados para el producto	uso en el hogar, centro de entretenimiento, espacio de trabajo, carga de dispositivos múltiples, protección contra sobretensionesuso en el hogar, centro de entretenimiento, espacio de trabajo, carga de dispositivos múltiples, prot… Ver más\nForma	Rectángulo\nTotal de puertos USB	4\nCorriente del adaptador de CA	16 Amperios',NULL,NULL);
/*!40000 ALTER TABLE `productos` ENABLE KEYS */;
UNLOCK TABLES;

--
-- Table structure for table `usuarios`
--

DROP TABLE IF EXISTS `usuarios`;
/*!40101 SET @saved_cs_client     = @@character_set_client */;
/*!40101 SET character_set_client = utf8 */;
CREATE TABLE `usuarios` (
  `id` int(11) NOT NULL AUTO_INCREMENT,
  `email` varchar(255) NOT NULL,
  `password` varchar(255) NOT NULL,
  `nombre` varchar(100) DEFAULT NULL,
  `rol` enum('admin','staff','user') DEFAULT 'user',
  `ban_until` datetime DEFAULT NULL,
  `ban_reason` text DEFAULT NULL,
  `is_verified` tinyint(1) DEFAULT 0,
  `verification_token` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`id`),
  UNIQUE KEY `email` (`email`)
) ENGINE=InnoDB AUTO_INCREMENT=8 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
/*!40101 SET character_set_client = @saved_cs_client */;

--
-- Dumping data for table `usuarios`
--

LOCK TABLES `usuarios` WRITE;
/*!40000 ALTER TABLE `usuarios` DISABLE KEYS */;
INSERT INTO `usuarios` VALUES (1,'orion24jj@gmail.com','123456','Gómez','user',NULL,NULL,1,NULL),(2,'11j@gmail.com','$2b$10$T8uM8crTVgXelUOuu9iLvOLdV7vdgSakXD8Y/419WY3aTot1B3vqe','CCC','staff',NULL,NULL,1,NULL),(3,'admin','$2b$10$UyZs9c1dRhZijGJVRw2ae.vCMKITVMmfINn/ubRbkFTItBwjlaC4u','Super Admin','admin',NULL,NULL,0,NULL),(4,'dark@gmail.com','123456','Dark','user',NULL,NULL,0,NULL),(5,'1@gmail.com','123456','Prueba','user',NULL,NULL,0,NULL),(6,'cp@gmail.com','123456','Gómezd','user',NULL,NULL,1,NULL),(7,'jrg01@iesemilidarder.com','$2b$10$CtkQ5jluPIn0uyHBsIM.5OrY7LHRsBpori0TW4oyO67sFBfUAbT/C','prueba','user',NULL,NULL,1,NULL);
/*!40000 ALTER TABLE `usuarios` ENABLE KEYS */;
UNLOCK TABLES;
/*!40103 SET TIME_ZONE=@OLD_TIME_ZONE */;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
/*!40014 SET UNIQUE_CHECKS=@OLD_UNIQUE_CHECKS */;
/*!40101 SET CHARACTER_SET_CLIENT=@OLD_CHARACTER_SET_CLIENT */;
/*!40101 SET CHARACTER_SET_RESULTS=@OLD_CHARACTER_SET_RESULTS */;
/*!40101 SET COLLATION_CONNECTION=@OLD_COLLATION_CONNECTION */;
/*!40111 SET SQL_NOTES=@OLD_SQL_NOTES */;

-- Dump completed on 2026-05-05  9:30:31
