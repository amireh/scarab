require 'rubygems'
require 'sinatra'

Sinatra::Base.set(:run, false)
Sinatra::Base.set(:evt, ENV['RACK_ENV'])

require 'app'
run Pixy::KiwiApp
