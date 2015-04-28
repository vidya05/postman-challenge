/**
 * Development environment settings
 *
 * This file can include shared settings for a development team,
 * such as API keys or remote database passwords.  If you're using
 * a version control solution for your Sails app, this file will
 * be committed to your repository unless you add it to your .gitignore
 * file.  If your repository will be publicly viewable, don't add
 * any private information to this file!
 *
 */

module.exports = {

  /***************************************************************************
   * Set the default database connection for models in the development       *
   * environment (see config/connections.js and config/models.js )           *
   ***************************************************************************/

  // models: {
  //   connection: 'someMongodbServer'
  // }

  twitter: {
		consumer_key: 'XklIkJeQlzctxe0Cqgjs6rDJ4',
        consumer_secret: 'eOjFiJsokjGz2Ob8yzBRfFw9MR5G5VLCODI1vEY90sM8bsPHvp',
        access_token: '733060994-OOpnGMwEnEbiXxaHJapCjzeuDPH3UaWtdEFBJAJM',
        access_token_secret: 'XaJqYp0hWHI1TcZlsAvXfPkXmMIoiQWgdfwLA6yWT64'
	}

};
