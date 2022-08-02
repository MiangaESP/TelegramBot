ENG:

This little bot for Telegram was made with NodeJS + Express, and webhook(ngrok) for host.

On .env file set telegram bot token and webhook url or else the bot won't work properly


The bot has four main functionalities, wether it's set on a private chat or a group.
·In general, if you send a text message, the bot will send you back same message.
·If you send a specific frase (that can be changed and/or expanded) it will send you a personalized response
·If you send a word or frase that has the same name on de images folder, it will send you the images.
·Last, if you send a frase with the structure "Reminder 'text' day-month-year hour:min",
 it will send you a text at the specified time.

ESP:

Este pequeño bot para Telegram se hizo con NodeJS + Express y webhook(ngrok) para el host.

En el archivo .env, ponga el token del bot de Telegram y la URL del webhook o,
de lo contrario, el bot no funcionará correctamente


El bot tiene cuatro funcionalidades principales, ya sea que esté configurado en un chat 1:1 o en un grupo.
·En general, si envía un mensaje de texto, el bot le devolverá el mismo mensaje.
·Si envía una frase específica (que puede ser modificada y/o ampliada) le enviará una respuesta personalizada.
·Si envía una palabra o frase que tiene el mismo nombre que una imagen de la carpeta de images, 
 le enviará dicha imagen.
·Por último, si envía una frase con la estructura "Reminder 'texto' día-mes-año hora:min",
 le enviará un mensaje de texto a la hora especificada.