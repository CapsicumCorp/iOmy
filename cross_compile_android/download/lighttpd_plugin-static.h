PLUGIN_INIT(mod_rewrite) /* PCRE */
PLUGIN_INIT(mod_redirect) /* PCRE */
PLUGIN_INIT(mod_alias)

PLUGIN_INIT(mod_extforward)

PLUGIN_INIT(mod_access)
//ERROR
//PLUGIN_INIT(mod_auth) /* CRYPT LDAP LBER */

PLUGIN_INIT(mod_setenv)

#ifdef HAVE_LUA
//ERROR
//PLUGIN_INIT(mod_magnet) /* LUA */
#endif
PLUGIN_INIT(mod_flv_streaming)

/* * indexfile must come before dirlisting for dirlisting not to override
*/
PLUGIN_INIT(mod_indexfile)
PLUGIN_INIT(mod_userdir)
PLUGIN_INIT(mod_dirlisting)

PLUGIN_INIT(mod_status)

PLUGIN_INIT(mod_simple_vhost)
#ifdef HAVE_MYSQL
PLUGIN_INIT(mod_mysql_vhost) /* MySQL */
#endif

PLUGIN_INIT(mod_secdownload)

PLUGIN_INIT(mod_cgi)
PLUGIN_INIT(mod_fastcgi)
PLUGIN_INIT(mod_scgi)

//ERROR
//PLUGIN_INIT(mod_ssi) /* PCRE */
PLUGIN_INIT(mod_proxy)

/* * staticfile must come after cgi/ssi/et al.
*/
PLUGIN_INIT(mod_staticfile)

#ifdef HAVE_LUA
//ERROR
//PLUGIN_INIT(mod_cml) /* MEMCACHE LUA LUALIB */
#endif

//PLUGIN_INIT(mod_trigger_b4_dl) /* PCRE */

//PLUGIN_INIT(mod_webdav) /* XML2 SQLITE3 UUID */

/* * post-processing modules
/**/
PLUGIN_INIT(mod_evasive)
PLUGIN_INIT(mod_compress) /* Z BZ2 */
PLUGIN_INIT(mod_usertrack)
PLUGIN_INIT(mod_expire)

//we really dont need this
//PLUGIN_INIT(mod_rrdtool)

PLUGIN_INIT(mod_accesslog)

