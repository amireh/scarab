# app.rb
Encoding.default_internal

ENV['APP_ROOT'] ||= File.dirname(__FILE__)
$LOAD_PATH << File.join(File.dirname(__FILE__), 'lib')

require 'rubygems'
require 'fileutils'
require 'sinatra'
require 'sinatra/base'
require 'sinatra/content_for'
require 'erb'
require 'json'
require 'scarab/scarab'

module Pixy
  class ScarabApp < Sinatra::Application
    include Sinatra::ContentFor

    # -+-+-+-+-+-+-+-+- #
    # - CONFIGURATION - #
    # -+-+-+-+-+-+-+-+- #
    configure do
      set :root,ENV['APP_ROOT']
      disable :sessions, :clean_trace
      disable :run

      mime_type :ttf, 'ttf'
      mime_type :woff, 'woff'
      mime_type :svg, 'svg'
      mime_type :eot, 'eot'
      
    end
   
    helpers do
      def javascripts(*files)
        html = "\n"
        files.each do |file|
          html.insert(-1, "<script src='/javascripts/#{file}.js' type='text/javascript'></script>\n")
        end
        html
      end
  
      def stylesheets(*files)
        html = "\n"
        files.each do |file|
          html.insert(-1, "<link href='/stylesheets/#{file}.css' media='screen' rel='stylesheet' type='text/css' />\n")
        end
        html
      end
    
      def image url, options = {}
        img = "<img src=\"#{url}\" "
    
        # force defaults
        options[:alt] ||= 'Untitled'
        options[:id] ||= 0
    
        # append options
        options.each do |key, val|
          img.insert(-1, "#{key}=\"#{val}\" ")
        end
        img.insert(-1, "/>")
      
        return img
      end
  
      def partial(view, options = {})
        erb :"#{view}", options.merge!(:layout => false)
      end
    
  
      def viewing?(page)
        return session[:current_page] == page
      end
    
    end
  
  
    get '/' do
      erb :index
    end
    
    get '/graph.json' do      
      content_type :json
      
      scarab = Scarab.new
      scarab.generate_grid(9).to_json
    end

  end
end

puts "Scarab has taken to the stage!!"
