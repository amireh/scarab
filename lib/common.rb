$LOAD_PATH << File.join(File.dirname(__FILE__), '..', '..')
$LOAD_PATH << File.join(File.dirname(__FILE__), '..', 'app')
$LOAD_PATH << File.join(File.dirname(__FILE__))

require 'rubygems'
require 'fileutils'
require 'sinatra'
require 'sinatra/base'
require 'sinatra/content_for'
require 'erb'
require 'json'
require 'kiwi/kiwi'

module Pixy

  @@init = false
  
  def self.log(msg, caller)
    if !@@init then
      @@logger = File.open("log.out", "w+")
    	@@logger.write("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n")
    	@@logger.write("+                        Ahmad Amireh                               +\n")
    	@@logger.write("+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+-+\n")
    	@@logger.flush
    	@@init = true
    end      
    
    @@logger.write( "+ #{caller.class.name.gsub("Pixy::", "")}: #{msg}\n" )
    @@logger.flush
  end
  
  class Application < Sinatra::Base
    
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
        
  end
  
end
