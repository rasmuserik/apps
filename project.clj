(defproject solsort.apps/apps "0.0.1"
  :dependencies
  [[org.clojure/clojure "1.8.0"]
   [org.clojure/clojurescript "1.7.170"]
   [org.clojure/core.async "0.2.374"]
   ;[cljsjs/pouchdb "3.5.0-1"]
   [cljsjs/showdown "0.4.0-1"]
   [solsort/util "0.1.2-SNAPSHOT"]
   [reagent "0.5.1"]
   ;[re-frame "0.5.0"]
   ]

  :plugins
  [[lein-cljsbuild "1.1.1"]
   [lein-ancient "0.6.8"]
   [lein-figwheel "0.5.0-2"]
   [lein-kibit "0.1.2"]]

  :source-paths ["src/"]

  :clean-targets ^{:protect false} 
  ["resources/public/out"
   "resources/public/index.js"
   "figwheel_server.log"
   "target/"]

  :cljsbuild 
  {:builds 
   [{:id "dev"
     :source-paths ["src/"]
     :figwheel {:websocket-host ~(.getHostAddress (java.net.InetAddress/getLocalHost))
               ; :on-jsload "" 
                }
     :compiler {:main solsort.apps.apps
                :asset-path "out"
                :output-to "resources/public/index.js"
                :output-dir "resources/public/out"
                :source-map-timestamp true }}
    {:id "dist"
     :source-paths ["src"]
     :compiler {:output-to "index.js"
                :main solsort.apps.apps
                :externs ["externs.js"]
                :optimizations :advanced
                :pretty-print true}}]}
  :figwheel {:nrepl-port 7888})
