require 'rubygems'
require 'sinatra'

$LOAD_PATH << File.expand_path(File.dirname(__FILE__))

Sinatra::Base.set(:run, false)
Sinatra::Base.set(:evt, ENV['RACK_ENV'])

require 'app'
run Pixy::ScarabApp
