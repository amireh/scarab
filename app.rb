# myapp.rb
ENV['APP_ROOT'] ||= File.dirname(__FILE__)

# config script
require ENV['APP_ROOT'] + '/lib/common.rb'

module Pixy
  class KiwiApp < Application
    include Sinatra::ContentFor
   
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
      
      kiwi = Kiwi.new
      kiwi.generate_graph.to_json      
    end

  end
end

puts "Kiwi has taken to the stage!!"
