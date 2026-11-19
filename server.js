/*
 BUNKER — единый файл приложения.
 Запуск:
   npm install socket.io
   node --input-type=module bunker.js
 Или добавьте в package.json: { "type": "module" } и запускайте: node bunker.js

 Требуется Node.js 18+ и установленный пакет socket.io.
 Клиентская страница, сервер Socket.IO, данные и игровая логика собраны здесь.
*/
import http from 'node:http';
import { randomInt, randomBytes } from 'node:crypto';
import { Server } from 'socket.io';

const HTML = Buffer.from('PCFkb2N0eXBlIGh0bWw+CjxodG1sIGxhbmc9InJ1Ij48aGVhZD48bWV0YSBjaGFyc2V0PSJ1dGYtOCI+CjxtZXRhIG5hbWU9InZpZXdwb3J0IiBjb250ZW50PSJ3aWR0aD1kZXZpY2Utd2lkdGgsaW5pdGlhbC1zY2FsZT0xLHZpZXdwb3J0LWZpdD1jb3ZlciI+Cjx0aXRsZT5CVU5LRVI8L3RpdGxlPgo8bGluayBocmVmPSJodHRwczovL2ZvbnRzLmdvb2dsZWFwaXMuY29tL2NzczI/ZmFtaWx5PVJhamRoYW5pOndnaHRANjAwOzcwMCZmYW1pbHk9SW50ZXI6d2dodEA0MDA7NjAwJmZhbWlseT1KZXRCcmFpbnMrTW9ubyZkaXNwbGF5PXN3YXAiIHJlbD0ic3R5bGVzaGVldCI+CjxzdHlsZT4KOnJvb3R7LS1iZzojMDgwQjBEOy0tYmcyOiMxMDE2MTk7LS1wbjojMTUxRDIwOy0tYmQ6IzI5MzQzODstLXR4OiNFNEU4RTU7LS10eDI6Izg0OTE5NTstLW9rOiM4RkFGOEM7LS13YTojRDdBMTRCOy0tZG46I0I5NEM0MzstLWluOiM2RDlFQUV9Cip7Ym94LXNpemluZzpib3JkZXItYm94fQpib2R5e21hcmdpbjowO2JhY2tncm91bmQ6cmFkaWFsLWdyYWRpZW50KGVsbGlwc2UgYXQgNTAlIDAsIzE0MjAxZix2YXIoLS1iZykgNjAlKTtjb2xvcjp2YXIoLS10eCk7Zm9udDoxNXB4LzEuNDUgSW50ZXIsc3lzdGVtLXVpLHNhbnMtc2VyaWY7bWluLWhlaWdodDoxMDBkdmh9CmJvZHk6OmFmdGVye2NvbnRlbnQ6IiI7cG9zaXRpb246Zml4ZWQ7aW5zZXQ6MDtwb2ludGVyLWV2ZW50czpub25lO2JhY2tncm91bmQ6cmVwZWF0aW5nLWxpbmVhci1ncmFkaWVudCgwZGVnLHJnYmEoMjU1LDI1NSwyNTUsLjAxNSkgMCAxcHgsdHJhbnNwYXJlbnQgMXB4IDNweCl9CmgxLGgyLGgzLC5sb2dve2ZvbnQtZmFtaWx5OlJhamRoYW5pLE9zd2FsZCxzYW5zLXNlcmlmO2xldHRlci1zcGFjaW5nOi4wOGVtO21hcmdpbjouM2VtIDB9Cmgxe2ZvbnQtc2l6ZTpjbGFtcCg0OHB4LDEydncsOTZweCk7bWFyZ2luOjB9Ci5tb25ve2ZvbnQtZmFtaWx5OidKZXRCcmFpbnMgTW9ubycsbW9ub3NwYWNlO2ZvbnQtc2l6ZToxMnB4O2NvbG9yOnZhcigtLXR4Mil9Ci5va3tjb2xvcjp2YXIoLS1vayl9Lndhe2NvbG9yOnZhcigtLXdhKX0uZG57Y29sb3I6dmFyKC0tZG4pfQoucGFuZWwsLnBue2JhY2tncm91bmQ6dmFyKC0tcG4pO2JvcmRlcjoxcHggc29saWQgdmFyKC0tYmQpO3BhZGRpbmc6MTJweDtib3JkZXItcmFkaXVzOjJweDtib3gtc2hhZG93OjAgNnB4IDIwcHggIzAwMDh9CmJ1dHRvbixpbnB1dCxzZWxlY3R7Zm9udDppbmhlcml0O2NvbG9yOnZhcigtLXR4KTtiYWNrZ3JvdW5kOnZhcigtLWJnMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1iZCk7cGFkZGluZzoxMHB4IDE0cHg7bWluLWhlaWdodDo0NHB4O2JvcmRlci1yYWRpdXM6MnB4fQpidXR0b257Y3Vyc29yOnBvaW50ZXI7Zm9udC1mYW1pbHk6UmFqZGhhbmksc2Fucy1zZXJpZjtsZXR0ZXItc3BhY2luZzouMDZlbTtmb250LXdlaWdodDo3MDA7dHJhbnNpdGlvbjouMTVzfQpidXR0b246aG92ZXI6bm90KDpkaXNhYmxlZCl7Ym9yZGVyLWNvbG9yOnZhcigtLW9rKTtib3gtc2hhZG93OjAgMCAxMHB4ICM4RkFGOEMzM30KYnV0dG9uOmRpc2FibGVke29wYWNpdHk6LjR9CmJ1dHRvbi5tYWlue2JhY2tncm91bmQ6IzIyMzAxZjtib3JkZXItY29sb3I6dmFyKC0tb2spO2NvbG9yOnZhcigtLW9rKX0KYnV0dG9uLmRue2JvcmRlci1jb2xvcjp2YXIoLS1kbik7Y29sb3I6dmFyKC0tZG4pfQppbnB1dHt3aWR0aDoxMDAlfQoubWVudSwubG9iYnl7bWF4LXdpZHRoOjk2MHB4O21hcmdpbjowIGF1dG87cGFkZGluZzoxMnB4fQouYmFye2Rpc3BsYXk6ZmxleDtnYXA6MTJweDthbGlnbi1pdGVtczpjZW50ZXI7ZmxleC13cmFwOndyYXA7anVzdGlmeS1jb250ZW50OnNwYWNlLWJldHdlZW47cGFkZGluZzo4cHggMDtib3JkZXItYm90dG9tOjFweCBzb2xpZCB2YXIoLS1iZCk7bWFyZ2luLWJvdHRvbToxMnB4fQoucm93e2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2ZsZXgtd3JhcDp3cmFwO21hcmdpbjo4cHggMH0ucm93Pip7ZmxleDoxIDEgMTQwcHh9CmxhYmVse2Rpc3BsYXk6YmxvY2s7Zm9udC1zaXplOjEycHg7Y29sb3I6dmFyKC0tdHgyKX0KLnBse2Rpc3BsYXk6ZmxleDtnYXA6OHB4O2FsaWduLWl0ZW1zOmNlbnRlcjtmbGV4LXdyYXA6d3JhcDtwYWRkaW5nOjhweCAwO2JvcmRlci1ib3R0b206MXB4IHNvbGlkIHZhcigtLWJkKX0KLnBsLm91dCBie3RleHQtZGVjb3JhdGlvbjpsaW5lLXRocm91Z2g7Y29sb3I6dmFyKC0tdHgyKX0KLnBsIC5tb25ve21hcmdpbi1sZWZ0OmF1dG99Ci5kb3R7d2lkdGg6OHB4O2hlaWdodDo4cHg7Ym9yZGVyLXJhZGl1czo1MCU7YmFja2dyb3VuZDp2YXIoLS1kbil9LmRvdC5vbntiYWNrZ3JvdW5kOnZhcigtLW9rKTtib3gtc2hhZG93OjAgMCA4cHggdmFyKC0tb2spO2FuaW1hdGlvbjpibCAyLjVzIGluZmluaXRlfQpAa2V5ZnJhbWVzIGJsezUwJXtvcGFjaXR5Oi4zNX19Ci5jaGlwc3tkaXNwbGF5OmZsZXg7Z2FwOjZweDtmbGV4LXdyYXA6d3JhcDt3aWR0aDoxMDAlfQouY2hpcHtiYWNrZ3JvdW5kOnZhcigtLWJnMik7Ym9yZGVyOjFweCBzb2xpZCB2YXIoLS1iZCk7cGFkZGluZzozcHggOHB4O2ZvbnQtc2l6ZToxM3B4fS5jaGlwIHNtYWxse2NvbG9yOnZhcigtLWluKTtkaXNwbGF5OmJsb2NrO2ZvbnQtc2l6ZToxMHB4fQouY29sc3tkaXNwbGF5OmdyaWQ7Z2FwOjEycHg7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmciAxZnJ9Ci5nYXRle2Rpc3BsYXk6ZmxleDtoZWlnaHQ6MTUwcHg7Ym9yZGVyOjJweCBzb2xpZCB2YXIoLS1iZCk7b3ZlcmZsb3c6aGlkZGVuO2JhY2tncm91bmQ6IzAwMDttYXJnaW46MTJweCAwfQouZ2F0ZSBpe2ZsZXg6MTtiYWNrZ3JvdW5kOnJlcGVhdGluZy1saW5lYXItZ3JhZGllbnQoOTBkZWcsIzFjMjYyOSAwIDdweCwjMTUxRDIwIDdweCAxNHB4KTt0cmFuc2l0aW9uOnRyYW5zZm9ybSA1cyBlYXNlLWlufQoub3BlbiAuZ2F0ZSBpOmZpcnN0LWNoaWxke3RyYW5zZm9ybTp0cmFuc2xhdGVYKC0xMDElKX0ub3BlbiAuZ2F0ZSBpOmxhc3QtY2hpbGR7dHJhbnNmb3JtOnRyYW5zbGF0ZVgoMTAxJSl9Ci50aW1lcntmb250LXNpemU6NDRweDtjb2xvcjp2YXIoLS13YSk7dGV4dC1hbGlnbjpjZW50ZXI7cGFkZGluZzo2cHh9Ci5nYW1le2Rpc3BsYXk6Z3JpZDtnYXA6OHB4O3BhZGRpbmc6OHB4O2dyaWQtdGVtcGxhdGUtY29sdW1uczoyNzBweCAxZnIgMzAwcHg7Z3JpZC10ZW1wbGF0ZS1hcmVhczoidG9wIHRvcCB0b3AiICJwbCBjZSBkb3MiICJwbCBjaGF0IGRvcyJ9Ci50b3B7Z3JpZC1hcmVhOnRvcH0uZy1wbHtncmlkLWFyZWE6cGx9LmctY2V7Z3JpZC1hcmVhOmNlfS5nLWRvc3tncmlkLWFyZWE6ZG9zfS5nLWNoYXR7Z3JpZC1hcmVhOmNoYXR9Ci5sb2d7aGVpZ2h0OjE4MHB4O292ZXJmbG93OmF1dG87bWFyZ2luLWJvdHRvbTo4cHh9Lm17cGFkZGluZzoycHggMDt3b3JkLWJyZWFrOmJyZWFrLXdvcmR9Lm0uc3lze2NvbG9yOnZhcigtLWluKTtmb250LXNpemU6MTNweH0ubS5ve2NvbG9yOnZhcigtLXR4Mil9Cm5hdntkaXNwbGF5Om5vbmV9CkBtZWRpYShtYXgtd2lkdGg6ODAwcHgpewogLmNvbHN7Z3JpZC10ZW1wbGF0ZS1jb2x1bW5zOjFmcn0KIC5nYW1le2Rpc3BsYXk6YmxvY2s7cGFkZGluZzo4cHggOHB4IDc2cHh9LnBue2Rpc3BsYXk6bm9uZTttYXJnaW4tYm90dG9tOjhweH0ucG4uc2hvdywudG9we2Rpc3BsYXk6YmxvY2t9CiAubG9ne2hlaWdodDo1MGR2aH0KIG5hdntkaXNwbGF5OmZsZXg7cG9zaXRpb246Zml4ZWQ7bGVmdDowO3JpZ2h0OjA7Ym90dG9tOjA7YmFja2dyb3VuZDp2YXIoLS1iZzIpO2JvcmRlci10b3A6MXB4IHNvbGlkIHZhcigtLWJkKTtwYWRkaW5nLWJvdHRvbTplbnYoc2FmZS1hcmVhLWluc2V0LWJvdHRvbSl9CiBuYXYgYnV0dG9ue2ZsZXg6MTtib3JkZXI6MDtib3JkZXItcmFkaXVzOjA7bWluLWhlaWdodDo1NnB4fW5hdiBidXR0b24ub257Y29sb3I6dmFyKC0tb2spO2JhY2tncm91bmQ6dmFyKC0tcG4pfQp9CiN0b2FzdHtwb3NpdGlvbjpmaXhlZDt0b3A6MTBweDtsZWZ0OjUwJTt0cmFuc2Zvcm06dHJhbnNsYXRlWCgtNTAlKTtiYWNrZ3JvdW5kOnZhcigtLWRuKTtwYWRkaW5nOjhweCAxNnB4O2Rpc3BsYXk6bm9uZTt6LWluZGV4Ojk7bWF4LXdpZHRoOjkwdnd9CmRldGFpbHN7bWFyZ2luLXRvcDoxMnB4fQo8L3N0eWxlPjwvaGVhZD4KPGJvZHk+PGRpdiBpZD0iYXBwIj48L2Rpdj48ZGl2IGlkPSJ0b2FzdCI+PC9kaXY+CjxzY3JpcHQgc3JjPSIvc29ja2V0LmlvL3NvY2tldC5pby5qcyI+PC9zY3JpcHQ+CjxzY3JpcHQ+CmNvbnN0ICQ9cz0+ZG9jdW1lbnQucXVlcnlTZWxlY3RvcihzKTsKY29uc3QgZXNjPXM9PlN0cmluZyhzKS5yZXBsYWNlKC9bJjw+IiddL2csYz0+KHsnJic6JyZhbXA7JywnPCc6JyZsdDsnLCc+JzonJmd0OycsJyInOicmcXVvdDsnLCInIjonJiMzOTsnfVtjXSkpOwpjb25zdCBMQkw9e3Byb2Zlc3Npb246J9Cf0YDQvtGE0LXRgdGB0LjRjycsYmlvOifQkdC40L4nLGhlYWx0aDon0JfQtNC+0YDQvtCy0YzQtScsaG9iYnk6J9Cl0L7QsdCx0LgnLGJhZ2dhZ2U6J9CR0LDQs9Cw0LYnLGZhY3Q6J9Ck0LDQutGCJ30sS0VZUz1PYmplY3Qua2V5cyhMQkwpOwpjb25zdCBQSD17UkVWRUFMOidSRVZFQUwgUEhBU0UnLERJU0NVU1M6J0RJU0NVU1NJT04gUEhBU0UnLFZPVEU6J1ZPVElORyBQSEFTRScsUkVTVUxUOidSRVNVTFRTJyxTVEFSVElORzonQUNDRVNTIEdSQU5URUQnfTsKY29uc3QgdG9rZW49bG9jYWxTdG9yYWdlLmJrX3Rva2VufHwobG9jYWxTdG9yYWdlLmJrX3Rva2VuPWNyeXB0by5yYW5kb21VVUlEKCkpOwpjb25zdCBzb2NrZXQ9aW8oe2F1dGg6e3Rva2VufX0pOwpsZXQgUz1udWxsLHRhYj0nZ2FtZScsY29ubj1mYWxzZSxyb29tcz1bXSxzdGF0cz17fSxza2V3PTAscHJldj0nJzsKbGV0IG5hbWU9bG9jYWxTdG9yYWdlLmJrX25hbWV8fCcnLGNvZGVWYWw9bmV3IFVSTFNlYXJjaFBhcmFtcyhsb2NhdGlvbi5zZWFyY2gpLmdldCgncm9vbScpfHwnJzsKY29uc3QgY2ZnPXttYXg6OCxwY3Q6NTAsZGlzY3VzczoxMjAsdm90ZTo0NSxpc1B1YmxpYzpmYWxzZX07CgpmdW5jdGlvbiB0b2FzdChtKXtjb25zdCB0PSQoJyN0b2FzdCcpO3QudGV4dENvbnRlbnQ9bTt0LnN0eWxlLmRpc3BsYXk9J2Jsb2NrJztjbGVhclRpbWVvdXQodG9hc3QudCk7dG9hc3QudD1zZXRUaW1lb3V0KCgpPT50LnN0eWxlLmRpc3BsYXk9J25vbmUnLDM1MDApfQpjb25zdCBhY3Q9KGV2LGQ9e30pPT5uZXcgUHJvbWlzZShyPT5zb2NrZXQuZW1pdChldixkLHJlcz0+e2lmKHJlcyYmIXJlcy5vayl0b2FzdChyZXMuZXJyb3IpO3IocmVzfHx7fSl9KSk7CnNvY2tldC5vbignY29ubmVjdCcsKCk9Pntjb25uPXRydWU7bGlzdFJvb21zKCk7cmVuZGVyKCl9KTsKc29ja2V0Lm9uKCdkaXNjb25uZWN0JywoKT0+e2Nvbm49ZmFsc2U7cmVuZGVyKCl9KTsKc29ja2V0Lm9uKCdzdGF0cycscz0+e3N0YXRzPXM7aWYoIVMpcmVuZGVyKCl9KTsKc29ja2V0Lm9uKCdub3Jvb20nLCgpPT57Uz1udWxsO3JlbmRlcigpfSk7CnNvY2tldC5vbignc3RhdGUnLHM9PnsKICBza2V3PXMubm93LURhdGUubm93KCk7CiAgaWYocy5waGFzZSE9PXByZXYpe2lmKHMucGhhc2U9PT0nVk9URScmJnMubWUuYWxpdmUpdGFiPSdwbGF5ZXJzJztpZihzLnBoYXNlPT09J1JFVkVBTCd8fHMucGhhc2U9PT0nUkVTVUxUJyl0YWI9J2dhbWUnO3ByZXY9cy5waGFzZX0KICBTPXM7cmVuZGVyKCk7Cn0pOwphc3luYyBmdW5jdGlvbiBsaXN0Um9vbXMoKXtpZighUyl7Y29uc3Qgcj1hd2FpdCBhY3QoJ3Jvb21zOmxpc3QnKTtyb29tcz1yLmxpc3R8fFtdO3JlbmRlcigpfX0Kc2V0SW50ZXJ2YWwobGlzdFJvb21zLDUwMDApOwpzZXRJbnRlcnZhbCgoKT0+e2NvbnN0IHQ9JCgnI3RpbWVyJyk7aWYodCl0LnRleHRDb250ZW50PXRtKCl9LDI1MCk7Cgpjb25zdCB0bT0oKT0+e2lmKCFTfHwhUy5lbmRzQXQpcmV0dXJuICctLTotLSc7Y29uc3QgbD1NYXRoLm1heCgwLE1hdGguY2VpbCgoUy5lbmRzQXQtRGF0ZS5ub3coKS1za2V3KS8xMDAwKSk7cmV0dXJuIFN0cmluZyhsLzYwfDApLnBhZFN0YXJ0KDIsJzAnKSsnOicrU3RyaW5nKGwlNjApLnBhZFN0YXJ0KDIsJzAnKX07CmNvbnN0IG9wdHM9KGEsdixmPXg9PngpPT5hLm1hcCh4PT5gPG9wdGlvbiB2YWx1ZT0iJHt4fSIgJHt4PT12PydzZWxlY3RlZCc6Jyd9PiR7Zih4KX08L29wdGlvbj5gKS5qb2luKCcnKTsKY29uc3QgTUFYPVs0LDUsNiw3LDgsOSwxMCwxMSwxMl0sUENUPVszMCw0MCw1MCw2MF0sRElTPVszMCw2MCwxMjAsMTgwLDMwMF0sVk9UPVsxNSwzMCw0NSw2MCwxMjBdOwoKZnVuY3Rpb24gcmVuZGVyKCl7CiAgY29uc3QgYT1kb2N1bWVudC5hY3RpdmVFbGVtZW50LGlkPWEmJmEuaWQsdj1hJiZhLnZhbHVlLHNzPWEmJmEuc2VsZWN0aW9uU3RhcnQ7CiAgJCgnI2FwcCcpLmlubmVySFRNTD0hUz9tZW51KCk6KFMucGhhc2U9PT0nTE9CQlknfHxTLnBoYXNlPT09J1NUQVJUSU5HJyk/bG9iYnkoKTpTLnBoYXNlPT09J0ZJTklTSEVEJz9maW5hbCgpOmdhbWUoKTsKICBpZihpZCYmJCgnIycraWQpKXtjb25zdCBlPSQoJyMnK2lkKTtpZihlLnRhZ05hbWU9PT0nSU5QVVQnJiZpZCE9PSdtc2cnKWUudmFsdWU9djtlLmZvY3VzKCk7dHJ5e2Uuc2V0U2VsZWN0aW9uUmFuZ2Uoc3Msc3MpfWNhdGNoe319CiAgY29uc3QgbD0kKCcubG9nJyk7aWYobClsLnNjcm9sbFRvcD1sLnNjcm9sbEhlaWdodDsKfQoKY29uc3QgbWVudT0oKT0+YDxtYWluIGNsYXNzPW1lbnU+CjxkaXYgY2xhc3M9YmFyPjxiIGNsYXNzPWxvZ28+QlVOS0VSPC9iPjxzcGFuIGNsYXNzPW1vbm8+U1VSVklWQUwgUFJPVE9DT0w8L3NwYW4+CjxzcGFuIGNsYXNzPSJtb25vICR7Y29ubj8nb2snOidkbid9Ij7il48gJHtjb25uPydPTkxJTkUnOidPRkZMSU5FJ30gwrcgJHtzdGF0cy5vbmxpbmU/PzB9INC40LPRgNC+0LrQvtCyIMK3ICR7c3RhdHMucm9vbXM/PzB9INC60L7QvNC90LDRgjwvc3Bhbj48L2Rpdj4KPGgxPkJVTktFUjwvaDE+PGRpdiBjbGFzcz0ibW9ubyB3YSI+U1VSVklWQUwgSVMgTk9UIEdVQVJBTlRFRUQ8L2Rpdj4KPHA+0JzQtdGB0YIg0LzQtdC90YzRiNC1LCDRh9C10Lwg0LLRi9C20LjQstGI0LjRhS4g0JTQvtC60LDQttC4LCDRh9GC0L4g0LTQvtGB0YLQvtC40L0g0L7RgdGC0LDRgtGM0YHRjy48L3A+CjxkaXYgY2xhc3M9cGFuZWw+PGxhYmVsPtCf0L7Qt9GL0LLQvdC+0Lk8L2xhYmVsPjxpbnB1dCBpZD1uYW1lIG1heGxlbmd0aD0yMCB2YWx1ZT0iJHtlc2MobmFtZSl9IiBvbmlucHV0PSJuYW1lPXRoaXMudmFsdWU7bG9jYWxTdG9yYWdlLmJrX25hbWU9bmFtZSI+CjxkaXYgY2xhc3M9cm93Pgo8ZGl2PjxsYWJlbD7QmNCz0YDQvtC60L7QsjwvbGFiZWw+PHNlbGVjdCBvbmNoYW5nZT0iY2ZnLm1heD0rdGhpcy52YWx1ZSI+JHtvcHRzKE1BWCxjZmcubWF4KX08L3NlbGVjdD48L2Rpdj4KPGRpdj48bGFiZWw+0JzQtdGB0YIg0LIg0LHRg9C90LrQtdGA0LU8L2xhYmVsPjxzZWxlY3Qgb25jaGFuZ2U9ImNmZy5wY3Q9K3RoaXMudmFsdWUiPiR7b3B0cyhQQ1QsY2ZnLnBjdCx4PT54KyclJyl9PC9zZWxlY3Q+PC9kaXY+CjxkaXY+PGxhYmVsPtCe0LHRgdGD0LbQtNC10L3QuNC1PC9sYWJlbD48c2VsZWN0IG9uY2hhbmdlPSJjZmcuZGlzY3Vzcz0rdGhpcy52YWx1ZSI+JHtvcHRzKERJUyxjZmcuZGlzY3Vzcyx4PT54Kycg0YEnKX08L3NlbGVjdD48L2Rpdj4KPGRpdj48bGFiZWw+0JPQvtC70L7RgdC+0LLQsNC90LjQtTwvbGFiZWw+PHNlbGVjdCBvbmNoYW5nZT0iY2ZnLnZvdGU9K3RoaXMudmFsdWUiPiR7b3B0cyhWT1QsY2ZnLnZvdGUseD0+eCsnINGBJyl9PC9zZWxlY3Q+PC9kaXY+PC9kaXY+CjxsYWJlbD48aW5wdXQgdHlwZT1jaGVja2JveCBzdHlsZT0id2lkdGg6YXV0bzttaW4taGVpZ2h0OjAiICR7Y2ZnLmlzUHVibGljPydjaGVja2VkJzonJ30gb25jaGFuZ2U9ImNmZy5pc1B1YmxpYz10aGlzLmNoZWNrZWQiPiDQn9GD0LHQu9C40YfQvdCw0Y8g0LrQvtC80L3QsNGC0LA8L2xhYmVsPgo8ZGl2IGNsYXNzPXJvdz48YnV0dG9uIGNsYXNzPW1haW4gb25jbGljaz0iYWN0KCdyb29tOmNyZWF0ZScse25hbWUsc2V0dGluZ3M6Y2ZnfSkiPtCh0J7Ql9CU0JDQotCsINCa0J7QnNCd0JDQotCjPC9idXR0b24+PC9kaXY+CjxkaXYgY2xhc3M9cm93PjxpbnB1dCBpZD1jb2RlIHBsYWNlaG9sZGVyPSJCSy0xMjM0NSIgdmFsdWU9IiR7ZXNjKGNvZGVWYWwpfSIgb25pbnB1dD0iY29kZVZhbD10aGlzLnZhbHVlIj48YnV0dG9uIG9uY2xpY2s9ImFjdCgncm9vbTpqb2luJyx7bmFtZSxjb2RlOmNvZGVWYWx9KSI+0J/QoNCY0KHQntCV0JTQmNCd0JjQotCs0KHQryDQn9CeINCa0J7QlNCjPC9idXR0b24+PC9kaXY+PC9kaXY+CjxkaXYgY2xhc3M9cGFuZWwgc3R5bGU9Im1hcmdpbi10b3A6MTJweCI+PGgzPtCe0KLQmtCg0KvQotCr0JUg0JrQntCc0J3QkNCi0Ks8L2gzPiR7cm9vbXMubGVuZ3RoP3Jvb21zLm1hcChyPT5gPGRpdiBjbGFzcz1wbD48Yj4ke3IuY29kZX08L2I+INCy0LXQtNGD0YnQuNC5ICR7ZXNjKHIuaG9zdHx8JycpfTxzcGFuIGNsYXNzPW1vbm8+JHtyLmNvdW50fS8ke3IubWF4fTwvc3Bhbj48YnV0dG9uIG9uY2xpY2s9ImFjdCgncm9vbTpqb2luJyx7bmFtZSxjb2RlOicke3IuY29kZX0nfSkiPtCS0J7QmdCi0Jg8L2J1dHRvbj48L2Rpdj5gKS5qb2luKCcnKTonPHNwYW4gY2xhc3M9bW9ubz7QndC10YIg0L7RgtC60YDRi9GC0YvRhSDQutC+0LzQvdCw0YI8L3NwYW4+J308L2Rpdj4KPGRldGFpbHMgY2xhc3M9cGFuZWw+PHN1bW1hcnk+0J/QoNCQ0JLQmNCb0JAg0JjQk9Cg0Ks8L3N1bW1hcnk+PHA+0JrQsNC20LTRi9C5INC/0L7Qu9GD0YfQsNC10YIg0YHQutGA0YvRgtC+0LUg0LTQvtGB0YzQtSDQuNC3IDYg0LrQsNGA0YIuINCa0LDQttC00YvQuSDRgNCw0YPQvdC0INC40LPRgNC+0LrQuCDRgNCw0YHQutGA0YvQstCw0Y7RgiDQv9C+INC+0LTQvdC+0Lkg0LrQsNGA0YLQtSAo0LIgMS3QvCDigJQg0L/RgNC+0YTQtdGB0YHQuNGOKSwg0L7QsdGB0YPQttC00LDRjtGCINC4INCz0L7Qu9C+0YHRg9GO0YIg0L/RgNC+0YLQuNCyINC+0LTQvdC+0LPQviDQutCw0L3QtNC40LTQsNGC0LAuINCR0L7Qu9GM0YjQtSDQstGB0LXRhSDQs9C+0LvQvtGB0L7QsiDigJQg0LjQt9Cz0L3QsNC9LiDQndC40YfRjNGPIOKAlCDQutC+0YDQvtGC0LrQvtC1INC+0LHRgdGD0LbQtNC10L3QuNC1INC4INC/0LXRgNC10LPQvtC70L7RgdC+0LLQsNC90LjQtSDQvNC10LbQtNGDINC70LjQtNC10YDQsNC80Lg7INC/0L7QstGC0L7RgNC90LDRjyDQvdC40YfRjNGPINGA0LXRiNCw0LXRgtGB0Y8g0YHQu9GD0YfQsNC50L3Qvi4g0JjQs9GA0LAg0LjQtNGR0YIsINC/0L7QutCwINC90LUg0L7RgdGC0LDQvdC10YLRgdGPINGB0YLQvtC70YzQutC+INC40LPRgNC+0LrQvtCyLCDRgdC60L7Qu9GM0LrQviDQvNC10YHRgiDQsiDQsdGD0L3QutC10YDQtS48L3A+PC9kZXRhaWxzPgo8cCBjbGFzcz1tb25vPnYwLjEgwrcg0LrQvtC0INC60L7QvNC90LDRgtGLOiDRgdGB0YvQu9C60LAg0LLQuNC00LAgLz9yb29tPUJLLTEyMzQ1PC9wPjwvbWFpbj5gOwoKY29uc3Qgc2VhdHNGb3I9KG4scCk9Pk1hdGgubWF4KDEsTWF0aC5taW4obi0xLE1hdGgucm91bmQobipwLzEwMCkpKTsKZnVuY3Rpb24gY2hhdEJveCgpe3JldHVybiBgPGRpdiBjbGFzcz1sb2c+JHtTLmNoYXQubWFwKG09PmA8ZGl2IGNsYXNzPSJtICR7bS5zeXM/J3N5cyc6Jyd9ICR7bS5vdXQ/J28nOicnfSI+JHttLnN5cz8nJzpgPGI+JHtlc2MobS5uYW1lKX08L2I+IGB9JHtlc2MobS50ZXh0KX08L2Rpdj5gKS5qb2luKCcnKX08L2Rpdj4KPGZvcm0gb25zdWJtaXQ9InJldHVybiBzZW5kKGV2ZW50KSI+PGlucHV0IGlkPW1zZyBtYXhsZW5ndGg9MzAwIHBsYWNlaG9sZGVyPSLQodC+0L7QsdGJ0LXQvdC40LUuLi4iIGF1dG9jb21wbGV0ZT1vZmY+PC9mb3JtPmB9CmZ1bmN0aW9uIHNlbmQoZSl7ZS5wcmV2ZW50RGVmYXVsdCgpO2NvbnN0IGk9JCgnI21zZycpLHQ9aS52YWx1ZTtpLnZhbHVlPScnO2lmKHQudHJpbSgpKWFjdCgnY2hhdDpzZW5kJyx7dGV4dDp0fSk7cmV0dXJuIGZhbHNlfQpmdW5jdGlvbiBjb3B5KHQpe25hdmlnYXRvci5jbGlwYm9hcmQ/LndyaXRlVGV4dCh0KS50aGVuKCgpPT50b2FzdCgn0KHQutC+0L/QuNGA0L7QstCw0L3QvicpKX0KCmZ1bmN0aW9uIGxvYmJ5KCl7CiAgY29uc3QgaD1TLmhvc3RJZD09PVMubWUuaWQsc3Q9Uy5waGFzZT09PSdTVEFSVElORycscz1TLnNldHRpbmdzLG1lPVMucGxheWVycy5maW5kKHA9PnAuaWQ9PT1TLm1lLmlkKTsKICBjb25zdCBzZWw9KGssYXJyLGYpPT5oP2A8c2VsZWN0IG9uY2hhbmdlPSJhY3QoJ3Jvb206c2V0dGluZ3MnLHsuLi5TLnNldHRpbmdzLCR7a306K3RoaXMudmFsdWV9KSI+JHtvcHRzKGFycixzW2tdLGYpfTwvc2VsZWN0PmA6KGY/ZihzW2tdKTpzW2tdKTsKICByZXR1cm4gYDxtYWluIGNsYXNzPSJsb2JieSAke3N0PydvcGVuJzonJ30iPjxkaXYgY2xhc3M9YmFyPjxiIGNsYXNzPWxvZ28+QlVOS0VSIMK3ICR7Uy5jb2RlfTwvYj4KPHNwYW4+PGJ1dHRvbiBvbmNsaWNrPSJjb3B5KCcke1MuY29kZX0nKSI+0JrQntCUPC9idXR0b24+IDxidXR0b24gb25jbGljaz0iY29weShsb2NhdGlvbi5vcmlnaW4rJy8/cm9vbT0ke1MuY29kZX0nKSI+0KHQodCr0JvQmtCQPC9idXR0b24+PC9zcGFuPjwvZGl2Pgo8ZGl2IGNsYXNzPWNvbHM+PHNlY3Rpb24gY2xhc3M9cGFuZWw+PGgzPtCj0KfQkNCh0KLQndCY0JrQmCAke1MucGxheWVycy5sZW5ndGh9LyR7cy5tYXh9PC9oMz4KJHtTLnBsYXllcnMubWFwKHA9PmA8ZGl2IGNsYXNzPXBsPjxzcGFuIGNsYXNzPSJkb3QgJHtwLmNvbm5lY3RlZD8nb24nOicnfSI+PC9zcGFuPjxiPiR7ZXNjKHAubmFtZSl9PC9iPiR7cC5pZD09PVMuaG9zdElkPycg4piFJzonJ308c3BhbiBjbGFzcz1tb25vPiR7cC5yZWFkeT8n0JPQntCi0J7Qkic6J9C+0LbQuNC00LDQtdGCJ308L3NwYW4+CiR7aCYmcC5pZCE9PVMubWUuaWQ/YDxidXR0b24gY2xhc3M9ZG4gb25jbGljaz0iYWN0KCdyb29tOmtpY2snLHt0YXJnZXQ6JyR7cC5pZH0nfSkiPuKclTwvYnV0dG9uPjxidXR0b24gb25jbGljaz0iYWN0KCdyb29tOnRyYW5zZmVyJyx7dGFyZ2V0Oicke3AuaWR9J30pIj7imIU8L2J1dHRvbj5gOicnfTwvZGl2PmApLmpvaW4oJycpfTwvc2VjdGlvbj4KPHNlY3Rpb24gY2xhc3M9cGFuZWw+PGRpdiBjbGFzcz1tb25vPkJVTktFUiBBQ0NFU1MgU1lTVEVNPC9kaXY+PGRpdiBjbGFzcz1nYXRlPjxpPjwvaT48aT48L2k+PC9kaXY+CjxkaXYgY2xhc3M9bW9ubz4ke3N0PyfQlNCe0KHQotCj0J8g0KDQkNCX0KDQldCo0IHQnSDigJQg0JfQkNCT0KDQo9CX0JrQkC4uLic6J9Cc0JXQodCiINCSINCR0KPQndCa0JXQoNCVOiAnK3NlYXRzRm9yKFMucGxheWVycy5sZW5ndGgscy5wY3QpfTwvZGl2Pgo8ZGl2IGNsYXNzPXJvdz48ZGl2PjxsYWJlbD7QmNCz0YDQvtC60L7QsjwvbGFiZWw+JHtzZWwoJ21heCcsTUFYKX08L2Rpdj48ZGl2PjxsYWJlbD7QnNC10YHRgjwvbGFiZWw+JHtzZWwoJ3BjdCcsUENULHg9PngrJyUnKX08L2Rpdj4KPGRpdj48bGFiZWw+0J7QsdGB0YPQttC00LXQvdC40LU8L2xhYmVsPiR7c2VsKCdkaXNjdXNzJyxESVMseD0+eCsnINGBJyl9PC9kaXY+PGRpdj48bGFiZWw+0JPQvtC70L7RgdC+0LLQsNC90LjQtTwvbGFiZWw+JHtzZWwoJ3ZvdGUnLFZPVCx4PT54Kycg0YEnKX08L2Rpdj48L2Rpdj48L3NlY3Rpb24+PC9kaXY+CjxkaXYgY2xhc3M9cm93PiR7aD9gPGJ1dHRvbiBjbGFzcz1tYWluICR7c3Q/J2Rpc2FibGVkJzonJ30gb25jbGljaz0iYWN0KCdyb29tOnN0YXJ0JykiPtCd0JDQp9CQ0KLQrCDQmNCT0KDQozwvYnV0dG9uPmA6YDxidXR0b24gY2xhc3M9bWFpbiAke3N0PydkaXNhYmxlZCc6Jyd9IG9uY2xpY2s9ImFjdCgncm9vbTpyZWFkeScse3ZhbHVlOiR7IW1lLnJlYWR5fX0pIj4ke21lLnJlYWR5PyfQndCVINCT0J7QotCe0JInOifQk9Ce0KLQntCSJ308L2J1dHRvbj5gfQo8YnV0dG9uIGNsYXNzPWRuIG9uY2xpY2s9ImFjdCgncm9vbTpsZWF2ZScpIj7Qn9Ce0JrQmNCd0KPQotCsPC9idXR0b24+PC9kaXY+CjxzZWN0aW9uIGNsYXNzPXBhbmVsPiR7Y2hhdEJveCgpfTwvc2VjdGlvbj48L21haW4+YDsKfQoKY29uc3QgY2FuVm90ZT1wPT5TLnBoYXNlPT09J1ZPVEUnJiZTLm1lLmFsaXZlJiYhUy5tZS52b3RlZCYmUy5jYW5kaWRhdGVzLmluY2x1ZGVzKHAuaWQpJiZwLmlkIT09Uy5tZS5pZDsKY29uc3QgY2hpcHM9cj0+T2JqZWN0LmVudHJpZXMocikubWFwKChbayx2XSk9PmA8c3BhbiBjbGFzcz1jaGlwPjxzbWFsbD4ke0xCTFtrXX08L3NtYWxsPiR7ZXNjKHYpfTwvc3Bhbj5gKS5qb2luKCcnKTsKZnVuY3Rpb24gcGxpc3QoKXtyZXR1cm4gUy5wbGF5ZXJzLm1hcChwPT5gPGRpdiBjbGFzcz0icGwgJHtwLmFsaXZlPycnOidvdXQnfSI+PHNwYW4gY2xhc3M9ImRvdCAke3AuY29ubmVjdGVkPydvbic6Jyd9Ij48L3NwYW4+PGI+JHtlc2MocC5uYW1lKX08L2I+JHtwLmlkPT09Uy5tZS5pZD8nICjQstGLKSc6Jyd9CjxzcGFuIGNsYXNzPW1vbm8+JHshcC5hbGl2ZT8ocC5sZWZ0PyfQn9Ce0JrQmNCd0KPQmyc6J9CY0JfQk9Cd0JDQnScpOnAudm90ZWQ/J9CT0J7Qm9Ce0KEg4pyTJzonJ308L3NwYW4+PGRpdiBjbGFzcz1jaGlwcz4ke2NoaXBzKHAucmV2ZWFsZWQpfTwvZGl2Pgoke2NhblZvdGUocCk/YDxidXR0b24gY2xhc3M9ZG4gb25jbGljaz0iYWN0KCd2b3RlOmNhc3QnLHt0YXJnZXQ6JyR7cC5pZH0nfSkiPtCT0J7Qm9Ce0KEg0J/QoNCe0KLQmNCSPC9idXR0b24+YDonJ308L2Rpdj5gKS5qb2luKCcnKX0KCmZ1bmN0aW9uIGRvc3NpZXIoKXtjb25zdCBtZT1TLm1lLGM9Uy5jYXRhc3Ryb3BoZTtyZXR1cm4gYDxoMz7Qm9CY0KfQndCe0JUg0JTQldCb0J48L2gzPjxkaXYgY2xhc3M9Y2hpcHM+JHttZS5jYXJkcz9LRVlTLm1hcChrPT5gPHNwYW4gY2xhc3M9Y2hpcCBzdHlsZT0iJHttZS5yZXZlYWxlZC5pbmNsdWRlcyhrKT8nYm9yZGVyLWNvbG9yOnZhcigtLW9rKSc6Jyd9Ij48c21hbGw+JHtMQkxba119JHttZS5yZXZlYWxlZC5pbmNsdWRlcyhrKT8nIMK3INCe0KLQmtCg0KvQotCeJzonIMK3INCh0JXQmtCg0JXQotCd0J4nfTwvc21hbGw+JHtlc2MobWUuY2FyZHNba10pfTwvc3Bhbj5gKS5qb2luKCcnKTonJ308L2Rpdj4KPGgzPtCa0JDQotCQ0KHQotCg0J7QpNCQPC9oMz48YiBjbGFzcz13YT4ke2VzYyhjLnRpdGxlKX08L2I+PHA+JHtlc2MoYy50ZXh0KX08L3A+CjxoMz7QkdCj0J3QmtCV0KA8L2gzPiR7T2JqZWN0LmVudHJpZXMoUy5idW5rZXIpLm1hcCgoW2ssdl0pPT5gPGRpdiBjbGFzcz1wbD4ke2t9PHNwYW4gY2xhc3M9bW9ubz4ke2VzYyh2KX08L3NwYW4+PC9kaXY+YCkuam9pbignJyl9YH0KCmZ1bmN0aW9uIGNlbnRlcigpe2NvbnN0IHBoPVMucGhhc2UsbWU9Uy5tZTtsZXQgaD1gPGgyPiR7UEhbcGhdfHxwaH08L2gyPmA7CiAgaWYocGg9PT0nUkVWRUFMJyloKz1tZS5jYW5SZXZlYWw/YDxwPtCg0LDRgdC60YDQvtC50YLQtSDQvtC00L3RgyDQutCw0YDRgtGDJHtTLnJvdW5kPT09MT8nICjQsiAxLdC8INGA0LDRg9C90LTQtSDigJQg0L/RgNC+0YTQtdGB0YHQuNGPKSc6Jyd9OjwvcD48ZGl2IGNsYXNzPWNoaXBzPiR7S0VZUy5maWx0ZXIoaz0+IW1lLnJldmVhbGVkLmluY2x1ZGVzKGspKS5tYXAoaz0+YDxidXR0b24gJHtTLnJvdW5kPT09MSYmayE9PSdwcm9mZXNzaW9uJz8nZGlzYWJsZWQnOicnfSBvbmNsaWNrPSJhY3QoJ2NhcmQ6cmV2ZWFsJyx7a2V5Oicke2t9J30pIj4ke0xCTFtrXX08L2J1dHRvbj5gKS5qb2luKCcnKX08L2Rpdj5gOic8cD7QntC20LjQtNCw0LXQvCDQvtGB0YLQsNC70YzQvdGL0YXigKY8L3A+JzsKICBlbHNlIGlmKHBoPT09J0RJU0NVU1MnKWgrPSc8cD7Qo9Cx0LXQtNC40YLQtSDQvtGB0YLQsNC70YzQvdGL0YUsINGH0YLQviDQvNC10YHRgtC+INCyINCx0YPQvdC60LXRgNC1INC90YPQttC90L4g0LjQvNC10L3QvdC+INCy0LDQvC48L3A+JzsKICBlbHNlIGlmKHBoPT09J1ZPVEUnKWgrPWA8cD4keyFtZS5hbGl2ZT8n0JLRiyDQstGL0LHRi9C70Lgg4oCUINC90LDQsdC70Y7QtNCw0LXRgtC1Lic6bWUudm90ZWQ/J9CT0L7Qu9C+0YEg0L/RgNC40L3Rj9GCLiDQltC00ZHQvCDQvtGB0YLQsNC70YzQvdGL0YUuJzon0JLRi9Cx0LXRgNC40YLQtSDQutCw0L3QtNC40LTQsNGC0LAg0L3QsCDQuNGB0LrQu9GO0YfQtdC90LjQtSDQstC+INCy0LrQu9Cw0LTQutC1IMKr0JjQs9GA0L7QutC4wrsuJ308L3A+YDsKICBlbHNlIGlmKHBoPT09J1JFU1VMVCcpe2NvbnN0IHI9Uy5sYXN0UmVzdWx0O2grPXIudGFsbHkubWFwKHQ9PmA8ZGl2IGNsYXNzPXBsPiR7ZXNjKHQubmFtZSl9PHNwYW4gY2xhc3M9bW9ubz4ke3Qudm90ZXN9PC9zcGFuPjwvZGl2PmApLmpvaW4oJycpK2A8cCBjbGFzcz0iJHtyLnRpZT8nd2EnOidkbid9Ij4ke3IudGllPyfQndC40YfRjNGPIOKAlCDQv9C10YDQtdCz0L7Qu9C+0YHQvtCy0LDQvdC40LUg0LzQtdC20LTRgyDQu9C40LTQtdGA0LDQvNC4Lic6J9CY0LfQs9C90LDQvTogJytlc2Moci5leGlsZWROYW1lKSsoci5yYW5kb20/JyAo0LbRgNC10LHQuNC5KSc6JycpfTwvcD5gfQogIHJldHVybiBgPGRpdiBjbGFzcz0idGltZXIgbW9ubyIgaWQ9dGltZXI+JHt0bSgpfTwvZGl2PiR7aH1gfQoKZnVuY3Rpb24gZ2FtZSgpe2NvbnN0IGFsaXZlPVMucGxheWVycy5maWx0ZXIocD0+cC5hbGl2ZSkubGVuZ3RoLFQ9W1snZ2FtZScsJ9Ck0JDQl9CQJ10sWydwbGF5ZXJzJywn0JjQk9Cg0J7QmtCYJ10sWydkb3MnLCfQlNCe0KHQrNCVJ10sWydjaGF0Jywn0KfQkNCiJ11dOwogIHJldHVybiBgPGRpdiBjbGFzcz1nYW1lPjxkaXYgY2xhc3M9InBuIHRvcCIgc3R5bGU9ImRpc3BsYXk6YmxvY2siPjxzcGFuIGNsYXNzPW1vbm8+JHtTLmNvZGV9IMK3INCg0JDQo9Cd0JQgJHtTLnJvdW5kfSDCtyDQntCh0KLQkNCb0J7QodCsICR7YWxpdmV9IC8g0JzQldCh0KIgJHtTLnNlYXRzfSDCtyA8c3BhbiBjbGFzcz0iJHtjb25uPydvayc6J2RuJ30iPiR7Y29ubj8n4pePINCh0JLQr9CX0KwnOifil48g0J3QldCiINCh0JLQr9CX0JgnfTwvc3Bhbj48L3NwYW4+PC9kaXY+CjxzZWN0aW9uIGNsYXNzPSJwbiBnLXBsICR7dGFiPT09J3BsYXllcnMnPydzaG93JzonJ30iPjxoMz7QmNCT0KDQntCa0Jg8L2gzPiR7cGxpc3QoKX08L3NlY3Rpb24+CjxzZWN0aW9uIGNsYXNzPSJwbiBnLWNlICR7dGFiPT09J2dhbWUnPydzaG93JzonJ30iPiR7Y2VudGVyKCl9PC9zZWN0aW9uPgo8c2VjdGlvbiBjbGFzcz0icG4gZy1kb3MgJHt0YWI9PT0nZG9zJz8nc2hvdyc6Jyd9Ij4ke2Rvc3NpZXIoKX08L3NlY3Rpb24+CjxzZWN0aW9uIGNsYXNzPSJwbiBnLWNoYXQgJHt0YWI9PT0nY2hhdCc/J3Nob3cnOicnfSI+JHtjaGF0Qm94KCl9PC9zZWN0aW9uPgo8bmF2PiR7VC5tYXAoKFtrLGxdKT0+YDxidXR0b24gY2xhc3M9IiR7dGFiPT09az8nb24nOicnfSIgb25jbGljaz0idGFiPScke2t9JztyZW5kZXIoKSI+JHtsfTwvYnV0dG9uPmApLmpvaW4oJycpfTwvbmF2PjwvZGl2PmB9CgpmdW5jdGlvbiBmaW5hbCgpe2NvbnN0IGg9Uy5ob3N0SWQ9PT1TLm1lLmlkLHc9Uy5wbGF5ZXJzLmZpbHRlcihwPT5wLmFsaXZlKSxsPVMucGxheWVycy5maWx0ZXIocD0+IXAuYWxpdmUpOwogIGNvbnN0IGJsaz0oYSxjLHQpPT5gPHNlY3Rpb24gY2xhc3M9cGFuZWw+PGgzIGNsYXNzPSIke2N9Ij4ke3R9PC9oMz4ke2EubWFwKHA9PmA8ZGl2IGNsYXNzPXBsPjxiPiR7ZXNjKHAubmFtZSl9PC9iPjxkaXYgY2xhc3M9Y2hpcHM+JHtjaGlwcyhwLnJldmVhbGVkKX08L2Rpdj48L2Rpdj5gKS5qb2luKCcnKX08L3NlY3Rpb24+YDsKICByZXR1cm4gYDxtYWluIGNsYXNzPWxvYmJ5PjxkaXYgY2xhc3M9YmFyPjxiIGNsYXNzPWxvZ28+QlVOS0VSIMK3ICR7Uy5jb2RlfTwvYj48c3BhbiBjbGFzcz1tb25vPtCc0JDQotCnINCX0JDQktCV0KDQqNCB0J08L3NwYW4+PC9kaXY+CjxwPjxiIGNsYXNzPXdhPiR7ZXNjKFMuY2F0YXN0cm9waGUudGl0bGUpfTwvYj4g4oCUICR7ZXNjKFMuY2F0YXN0cm9waGUudGV4dCl9PC9wPgo8ZGl2IGNsYXNzPWNvbHM+JHtibGsodywnb2snLCdTVVJWSVZPUlMgQ09ORklSTUVEJyl9JHtibGsobCwnZG4nLCdBQ0NFU1MgREVOSUVEJyl9PC9kaXY+CjxzZWN0aW9uIGNsYXNzPXBhbmVsPjxoMz7QodCe0KHQotCe0K/QndCY0JUg0JHQo9Cd0JrQldCg0JA8L2gzPiR7T2JqZWN0LmVudHJpZXMoUy5idW5rZXIpLm1hcCgoW2ssdl0pPT5gPGRpdiBjbGFzcz1wbD4ke2t9PHNwYW4gY2xhc3M9bW9ubz4ke2VzYyh2KX08L3NwYW4+PC9kaXY+YCkuam9pbignJyl9PC9zZWN0aW9uPgo8ZGl2IGNsYXNzPXJvdz4ke2g/YDxidXR0b24gY2xhc3M9bWFpbiBvbmNsaWNrPSJhY3QoJ3Jvb206cmVtYXRjaCcpIj7QndCe0JLQq9CZINCc0JDQotCnINCSINCb0J7QkdCR0Jg8L2J1dHRvbj5gOicnfTxidXR0b24gY2xhc3M9ZG4gb25jbGljaz0iYWN0KCdyb29tOmxlYXZlJykiPtCSINCT0JvQkNCS0J3QntCVINCc0JXQndCuPC9idXR0b24+PC9kaXY+CjxzZWN0aW9uIGNsYXNzPXBhbmVsPiR7Y2hhdEJveCgpfTwvc2VjdGlvbj48L21haW4+YH0KcmVuZGVyKCk7Cjwvc2NyaXB0PjwvYm9keT48L2h0bWw+Cg==', 'base64').toString('utf8');


// ===== ДАННЫЕ И КАРТЫ =====
const pick = a => a[randomInt(a.length)];

// Базовые наборы (без [18+]). Расширяйте списки своими картами.
const PROF = ['Врач-хирург','Инженер-строитель','Учитель биологии','Военный офицер','Повар','Электрик','Психолог','Фермер','Химик-лаборант','Механик','Спасатель МЧС','Программист','Медсестра','Ветеринар','Пилот вертолёта','Радиоинженер','Сварщик','Агроном','Фармацевт','Геолог'];
const HEALTH = ['Абсолютно здоров','Аллергия на пыль','Хроническая бессонница','Астма','Диабет 1 типа','Гипертония','Плохое зрение (−8)','Дальтонизм','Хромота','Артрит','Мигрени','Эпилепсия','Панические атаки','Анемия','Гастрит','Заикание','Сколиоз','Туберкулёз (в ремиссии)'];
const HOBBY = ['Рыбалка','Охота','Вязание','Шахматы','Садоводство','Кулинария','Резьба по дереву','Гончарное дело','Радиолюбительство','Астрономия','Скалолазание','Стрельба из лука','Йога','Игра на гитаре'];
const BAG = ['Аптечка','Нож','Топор','Верёвка 20 м','Спички (10 коробков)','Фонарик','Рация','Компас','Фильтр для воды','Мультитул','Семена овощей','Учебник по медицине','Солнечная батарея (малая)','Колода карт','Гитара'];
const FACT = ['Служил в армии','Имеет двоих детей','Умеет оказывать первую помощь','Знает три языка','Вырос в деревне','Работал волонтёром','Боится темноты','Страдает клаустрофобией','Не умеет плавать','Знает съедобные грибы','Разбирается в травах','Имеет редкую группу крови','Был судим за кражу','Врал в резюме'];

const CATASTROPHES = [
  { title: 'Ядерная зима', text: 'Пепел закрыл небо. Температура на поверхности — минус 40. Урожаи невозможны минимум 10 лет.' },
  { title: 'Неизвестная инфекция', text: 'Вирус с летальностью 70% распространяется по воздуху. Снаружи небезопасно без защиты.' },
  { title: 'Падение астероида', text: 'Удар поднял пыль и цунами. Побережья уничтожены, связь потеряна.' },
  { title: 'Солнечная вспышка', text: 'Электроника и энергосети мира выгорели. Современные технологии недоступны.' },
  { title: 'Глобальное наводнение', text: 'Уровень океана вырос на 60 м. Суша осталась лишь на горных плато.' },
  { title: 'Экологический коллапс', text: 'Почва и вода отравлены. Чистой воды и пищи снаружи почти нет.' }
];

const genDossier = () => ({
  profession: pick(PROF),
  bio: `${pick(['Мужчина', 'Женщина'])}, ${randomInt(18, 71)} лет`,
  health: pick(HEALTH), hobby: pick(HOBBY), baggage: pick(BAG), fact: pick(FACT)
});

const genBunker = seats => ({
  'Вместимость': `${seats} мест`,
  'Еда': `на ${randomInt(3, 25)} мес.`,
  'Вода': pick(['скважина + фильтры', 'запас на 6 мес.', 'конденсат, малый дебит']),
  'Электричество': pick(['дизель-генератор', 'геотермальная станция', 'аккумуляторы, 4 мес.']),
  'Медицина': pick(['полный медблок', 'аптечки и фельдшерский пункт', 'отсутствует']),
  'Вентиляция': pick(['исправна', 'фильтры изношены', 'работает на 60%']),
  'Автономность': `${randomInt(6, 37)} мес.`,
  'Помещения': pick(['оранжерея', 'мастерская', 'библиотека', 'спортзал', 'лаборатория'])
});


// ===== ИГРОВОЙ ДВИЖОК =====
const rooms = new Map();
const KEYS = ['profession', 'bio', 'health', 'hobby', 'baggage', 'fact'];
const fail = m => { throw Object.assign(new Error(m), { user: true }); };
const clamp = (v, a, b, d) => (Number.isFinite(+v) ? Math.min(b, Math.max(a, Math.round(+v))) : d);
const list = room => [...room.players.values()];
const alive = room => list(room).filter(p => p.alive);

function cleanSettings(s = {}) {
  return {
    max: clamp(s.max, 4, 12, 8),
    pct: [30, 40, 50, 60].includes(+s.pct) ? +s.pct : 50,
    discuss: clamp(s.discuss, 30, 300, 120),
    vote: clamp(s.vote, 15, 120, 45),
    isPublic: !!s.isPublic
  };
}

const newPlayer = name => ({
  id: randomBytes(4).toString('hex'), sid: null,
  name: String(name || '').trim().slice(0, 20) || 'Игрок',
  connected: true, ready: false, alive: true, exiled: false, left: false,
  cards: null, revealed: new Set(), revealedRound: 0, vote: null, lastChat: 0
});

function newCode() { let c; do c = 'BK-' + randomInt(10000, 100000); while (rooms.has(c)); return c; }
function sys(room, text) { room.chat.push({ sys: true, text, t: Date.now() }); room.chat = room.chat.slice(-100); }
function need(room, pid) { return room.players.get(pid) || fail('Игрок не найден'); }
function host(room, pid) { if (pid !== room.hostId) fail('Только ведущий'); }

function createRoom(settings, hostPlayer, notify) {
  const room = {
    code: newCode(), hostId: hostPlayer.id, settings: cleanSettings(settings),
    players: new Map([[hostPlayer.id, hostPlayer]]), phase: 'LOBBY', round: 0, seats: 0,
    chat: [], endsAt: null, timer: null, tieSet: null, revote: false, lastResult: null,
    catastrophe: null, bunker: null, touched: Date.now(),
    notify: () => { room.touched = Date.now(); notify(room); }
  };
  hostPlayer.ready = true;
  rooms.set(room.code, room);
  return room;
}

function addPlayer(room, p) {
  if (room.phase !== 'LOBBY') fail('Матч уже идёт');
  if (room.players.size >= room.settings.max) fail('Комната заполнена');
  room.players.set(p.id, p);
  sys(room, `${p.name} подключился`);
  room.notify();
}

function setSettings(room, pid, s) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Настройки закрыты');
  const n = cleanSettings(s);
  if (n.max < room.players.size) n.max = room.players.size;
  room.settings = n; room.notify();
}

function setReady(room, pid, v) {
  const p = need(room, pid); if (room.phase !== 'LOBBY') return;
  p.ready = pid === room.hostId ? true : !!v; room.notify();
}

function kick(room, pid, target) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Только в лобби');
  if (target === pid) fail('Нельзя исключить себя');
  const t = need(room, target); room.players.delete(target);
  sys(room, `${t.name} исключён ведущим`); room.notify(); return t;
}

function transferHost(room, to) {
  const c = list(room).filter(p => !p.left);
  const n = (to && room.players.get(to)) || c.find(p => p.connected && p.id !== room.hostId) || c.find(p => p.id !== room.hostId);
  if (!n) return;
  room.hostId = n.id; n.ready = true; sys(room, `${n.name} теперь ведущий`);
}
function giveHost(room, pid, to) { host(room, pid); need(room, to); transferHost(room, to); room.notify(); }

function destroy(room) { clearTimeout(room.timer); rooms.delete(room.code); }

function removePlayer(room, pid) {
  const p = room.players.get(pid); if (!p) return;
  sys(room, `${p.name} покинул комнату`);
  if (room.phase === 'LOBBY' || room.phase === 'FINISHED') room.players.delete(pid);
  else Object.assign(p, { left: true, alive: false, exiled: true, connected: false });
  if (!list(room).some(x => !x.left)) return destroy(room);
  if (room.hostId === pid) transferHost(room);
  if (!['LOBBY', 'FINISHED', 'STARTING'].includes(room.phase) && alive(room).length <= room.seats) return finish(room);
  progress(room);
}

function setConnected(room, pid, v) {
  const p = room.players.get(pid); if (!p) return;
  p.connected = v;
  if (!v) progress(room); else room.notify();
}

function start(room, pid) {
  host(room, pid); if (room.phase !== 'LOBBY') fail('Матч уже начат');
  const ps = list(room);
  if (ps.length < 4) fail('Нужно минимум 4 игрока');
  if (ps.some(p => !p.ready)) fail('Не все игроки готовы');
  room.seats = Math.max(1, Math.min(ps.length - 1, Math.round(ps.length * room.settings.pct / 100)));
  room.catastrophe = pick(CATASTROPHES); room.bunker = genBunker(room.seats);
  for (const p of ps) Object.assign(p, { alive: true, exiled: false, left: false, cards: genDossier(), revealed: new Set(), revealedRound: 0, vote: null });
  room.round = 0; room.lastResult = null; room.tieSet = null; room.revote = false;
  setPhase(room, 'STARTING', 6);
}

function setPhase(room, phase, secs) {
  clearTimeout(room.timer);
  room.phase = phase;
  room.endsAt = secs ? Date.now() + secs * 1000 : null;
  if (secs) room.timer = setTimeout(() => tick(room), secs * 1000);
  room.notify();
}

// Срабатывает по таймеру (экспортирован для тестов).
function tick(room) {
  switch (room.phase) {
    case 'STARTING': return nextRound(room);
    case 'REVEAL':
      for (const p of alive(room)) if (p.revealedRound !== room.round) {
        const free = KEYS.filter(k => !p.revealed.has(k));
        if (free.length) doReveal(room, p, room.round === 1 ? 'profession' : pick(free));
      }
      return startDiscuss(room);
    case 'DISCUSS': return startVote(room);
    case 'VOTE': return resolveVote(room);
    case 'RESULT': return room.lastResult?.tie ? startDiscuss(room) : nextRound(room);
  }
}

function nextRound(room) {
  room.round++; room.tieSet = null; room.revote = false;
  for (const p of list(room)) p.vote = null;
  setPhase(room, 'REVEAL', 60);
}
const startDiscuss = room => setPhase(room, 'DISCUSS', room.revote ? 30 : room.settings.discuss);
function startVote(room) { for (const p of list(room)) p.vote = null; setPhase(room, 'VOTE', room.settings.vote); }
const candidates = room => room.tieSet || alive(room).map(p => p.id);

function doReveal(room, p, key) { p.revealed.add(key); p.revealedRound = room.round; }

function reveal(room, pid, key) {
  const p = need(room, pid);
  if (room.phase !== 'REVEAL') fail('Сейчас нельзя раскрывать карты');
  if (!p.alive) fail('Вы выбыли');
  if (p.revealedRound === room.round) fail('В этом раунде карта уже раскрыта');
  if (!KEYS.includes(key) || p.revealed.has(key)) fail('Недопустимая карта');
  if (room.round === 1 && key !== 'profession') fail('В первом раунде раскрывается профессия');
  doReveal(room, p, key); progress(room);
}

function vote(room, pid, target) {
  const p = need(room, pid);
  if (room.phase !== 'VOTE') fail('Сейчас не голосование');
  if (!p.alive) fail('Выбывшие не голосуют');
  if (p.vote) fail('Голос уже отдан');
  if (target === pid) fail('Нельзя голосовать за себя');
  if (!candidates(room).includes(target)) fail('Недопустимый кандидат');
  p.vote = target; progress(room);
}

function progress(room) {
  const a = alive(room);
  if (room.phase === 'REVEAL' && a.every(p => p.revealedRound === room.round || p.revealed.size >= KEYS.length)) return startDiscuss(room);
  if (room.phase === 'VOTE' && a.filter(p => p.connected).every(p => p.vote)) return resolveVote(room);
  room.notify();
}

function resolveVote(room) {
  const tally = {};
  for (const p of alive(room)) if (p.vote) tally[p.vote] = (tally[p.vote] || 0) + 1;
  const max = Math.max(0, ...Object.values(tally));
  let leaders = Object.keys(tally).filter(k => tally[k] === max);
  if (!leaders.length) leaders = candidates(room);
  const rows = candidates(room).map(id => ({ name: room.players.get(id).name, votes: tally[id] || 0 })).sort((a, b) => b.votes - a.votes);
  if (leaders.length > 1 && !room.revote) {
    room.revote = true; room.tieSet = leaders;
    room.lastResult = { round: room.round, tally: rows, tie: true };
    return setPhase(room, 'RESULT', 6);
  }
  const out = room.players.get(leaders.length === 1 ? leaders[0] : pick(leaders));
  Object.assign(out, { alive: false, exiled: true });
  room.lastResult = { round: room.round, tally: rows, tie: false, exiledName: out.name, random: leaders.length > 1 };
  sys(room, `${out.name} изгнан из бункера`);
  if (alive(room).length <= room.seats) return finish(room);
  setPhase(room, 'RESULT', 8);
}

function finish(room) { clearTimeout(room.timer); room.endsAt = null; room.phase = 'FINISHED'; room.notify(); }

function rematch(room, pid) {
  host(room, pid); if (room.phase !== 'FINISHED') fail('Матч ещё не завершён');
  for (const [id, p] of room.players) if (p.left) room.players.delete(id);
  for (const p of list(room)) Object.assign(p, { ready: p.id === room.hostId, alive: true, exiled: false, cards: null, revealed: new Set(), revealedRound: 0, vote: null });
  Object.assign(room, { phase: 'LOBBY', round: 0, lastResult: null, tieSet: null, revote: false, catastrophe: null, bunker: null });
  room.notify();
}

function chat(room, pid, text) {
  const p = need(room, pid), now = Date.now();
  if (now - p.lastChat < 800) fail('Слишком часто');
  text = String(text || '').trim().slice(0, 300); if (!text) return;
  p.lastChat = now;
  room.chat.push({ id: pid, name: p.name, text, t: now, out: !p.alive && room.phase !== 'LOBBY' });
  room.chat = room.chat.slice(-100); room.notify();
}

function sweep() { for (const r of rooms.values()) if (Date.now() - r.touched > 30 * 60e3) destroy(r); }

// Состояние, видимое конкретному игроку: чужие скрытые карты и чужие голоса не передаются.
function viewFor(room, pid) {
  const me = room.players.get(pid), done = room.phase === 'FINISHED';
  const open = p => (p.cards ? Object.fromEntries(Object.entries(p.cards).filter(([k]) => done || p.exiled || p.revealed.has(k))) : {});
  return {
    now: Date.now(), code: room.code, phase: room.phase, round: room.round, seats: room.seats,
    endsAt: room.endsAt, settings: room.settings, hostId: room.hostId,
    catastrophe: room.catastrophe, bunker: room.bunker, lastResult: room.lastResult,
    candidates: room.phase === 'VOTE' ? candidates(room) : [],
    me: {
      id: me.id, alive: me.alive, cards: me.cards, revealed: [...me.revealed], voted: !!me.vote,
      canReveal: room.phase === 'REVEAL' && me.alive && me.revealedRound !== room.round && me.revealed.size < KEYS.length
    },
    players: list(room).map(p => ({
      id: p.id, name: p.name, connected: p.connected, ready: p.ready, alive: p.alive, left: p.left,
      voted: room.phase === 'VOTE' && !!p.vote, revealed: open(p)
    })),
    chat: room.chat.slice(-60)
  };
}


// ===== HTTP + SOCKET.IO СЕРВЕР =====
const PORT = process.env.PORT || 3000;
const server = http.createServer((req, res) => {
  if (req.url.startsWith('/health')) {
    res.writeHead(200, { 'content-type': 'text/plain; charset=utf-8' });
    return res.end('ok');
  }
  res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' });
  res.end(HTML);
});
const io = new Server(server, { cors: { origin: process.env.CORS_ORIGIN || false } });
const sessions = new Map(); // token -> { code, pid }

const notify = room => { for (const p of room.players.values()) if (p.sid) io.to(p.sid).emit('state', viewFor(room, p.id)); };
const stats = () => ({ online: io.engine.clientsCount, rooms: rooms.size });

io.on('connection', socket => {
  const token = String(socket.handshake.auth?.token || '').slice(0, 64);
  if (token.length < 16) return socket.disconnect(true);
  const cur = () => {
    const s = sessions.get(token), room = s && rooms.get(s.code), p = room?.players.get(s.pid);
    return p ? { room, p } : null;
  };
  const need = () => cur() || fail('Вы не в комнате');
  const bind = (room, p) => { p.sid = socket.id; sessions.set(token, { code: room.code, pid: p.id }); };

  socket.emit('stats', stats());
  const c0 = cur();
  if (c0) { c0.p.sid = socket.id; setConnected(c0.room, c0.p.id, true); } // восстановление после обрыва/обновления
  else socket.emit('noroom');

  const on = (ev, fn) => socket.on(ev, async (data, cb) => {
    cb = typeof cb === 'function' ? cb : () => {};
    try { cb({ ok: true, ...(await fn(data || {})) }); }
    catch (e) { cb({ ok: false, error: e.user ? e.message : 'Ошибка сервера' }); if (!e.user) console.error(e); }
  });

  on('room:create', ({ name, settings }) => {
    if (cur()) fail('Вы уже в комнате');
    const p = newPlayer(name); p.sid = socket.id;
    const room = createRoom(settings, p, notify); bind(room, p); room.notify();
  });
  on('room:join', ({ name, code }) => {
    if (cur()) fail('Вы уже в комнате');
    const room = rooms.get(String(code || '').trim().toUpperCase()) || fail('Комната не найдена');
    const p = newPlayer(name); bind(room, p); addPlayer(room, p);
  });
  on('rooms:list', () => ({
    list: [...rooms.values()].filter(r => r.settings.isPublic && r.phase === 'LOBBY')
      .map(r => ({ code: r.code, host: r.players.get(r.hostId)?.name, count: r.players.size, max: r.settings.max }))
  }));
  on('room:ready', ({ value }) => { const { room, p } = need(); setReady(room, p.id, value); });
  on('room:settings', s => { const { room, p } = need(); setSettings(room, p.id, s); });
  on('room:start', () => { const { room, p } = need(); start(room, p.id); });
  on('room:rematch', () => { const { room, p } = need(); rematch(room, p.id); });
  on('room:transfer', ({ target }) => { const { room, p } = need(); giveHost(room, p.id, target); });
  on('room:kick', ({ target }) => {
    const { room, p } = need(); const t = kick(room, p.id, target);
    for (const [tk, s] of sessions) if (s.pid === t.id && s.code === room.code) sessions.delete(tk);
    if (t.sid) io.to(t.sid).emit('noroom');
  });
  on('room:leave', () => { const { room, p } = need(); sessions.delete(token); removePlayer(room, p.id); socket.emit('noroom'); });
  on('card:reveal', ({ key }) => { const { room, p } = need(); reveal(room, p.id, key); });
  on('vote:cast', ({ target }) => { const { room, p } = need(); vote(room, p.id, target); });
  on('chat:send', ({ text }) => { const { room, p } = need(); chat(room, p.id, text); });

  socket.on('disconnect', () => {
    const c = cur(); if (!c || c.p.sid !== socket.id) return;
    setConnected(c.room, c.p.id, false);
    if (c.room.hostId === c.p.id) setTimeout(() => { // автопередача ведущего
      if (rooms.has(c.room.code) && !c.p.connected && c.room.hostId === c.p.id) { transferHost(c.room); c.room.notify(); }
    }, 20000);
  });
});

setInterval(() => io.emit('stats', stats()), 5000);
setInterval(() => sweep(), 60000);
server.listen(PORT, () => console.log(`BUNKER server on :${PORT}`));
