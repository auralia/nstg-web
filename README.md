# nstg-web #

nstg-web is a free and open source web application that allows you to easily 
send telegrams to a list of NationStates nations defined using a powerful query 
language called Telegram Recipient Language.

nstg-web features the following:

* ability to send telegrams to complex sets of nations defined using TRL or to
  simple lists of nations
* a continuous mode that periodically updates the recipients list with new
  nations that match the provided TRL string, which is useful for recruitment 
  purposes
* a dry-run mode that allows you to test TRL strings
* progress reporting
* rate-limiting
* ability to save configuration
* ability to automatically save past recipients to avoid sending a nation the 
  same telegram twice

## Usage ##

The latest version of nstg-web can be accessed [here](https://auralia.github.io/nstg-web/build).

You can also build nstg-web from source using Gulp. There are two main 
targets: `prod` and `dev`. The only difference between them is that `dev` 
includes source maps.

## License ##

nstg-web is licensed under the [Apache License 2.0](http://www.apache.org/licenses/LICENSE-2.0).
