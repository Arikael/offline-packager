# offline-packager

Collection of tools/packagers to download/upload packages (e.g. nuget, npm)
from a public repository and use them (i.e. upload to a private repository)
in an offline/air gapped environment.

It's currently in a very early stage.  
Below is table with all planned packagers and their current state.  
The order in the table is the planned order of implementation.

Besides having every offline-packager as standalone, it's planned to use somekind of
orchestration, where a central service will control all packagers (download/upload) to easily
automate the workflow.

|                       |  Download   | Upload | Containerize |
| --------------------- | :---------: | :----: | :----------: |
| NPM                   | in progress |  :x:   |     :x:      |
| NuGet                 |     :x:     |  :x:   |     :x:      |
| Docker                |     :x:     |  :x:   |     :x:      |
| Orchestration Service |     :x:     |  :x:   |     :x:      |
| Helm                  |     :x:     |  :x:   |     :x:      |
| Java                  |     :x:     |  :x:   |     :x:      |
| Go                    |     :x:     |  :x:   |     :x:      |
| Python                |     :x:     |  :x:   |     :x:      |
