# Simple Static File Server in pure PowerShell
# Serves the rental real estate website on http://localhost:8080/

$port = 8080
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  Rental Real Estate Server is Running!  " -ForegroundColor Green
    Write-Host "  Access portal: http://localhost:$port/ " -ForegroundColor Cyan
    Write-Host "=========================================" -ForegroundColor Green
    Write-Host "  Press Ctrl+C in this terminal to stop.  " -ForegroundColor Yellow
} catch {
    Write-Error "Failed to start HttpListener. Make sure port $port is not already in use."
    exit 1
}

$mimeTypeMapping = @{
    ".html" = "text/html; charset=utf-8"
    ".css"  = "text/css; charset=utf-8"
    ".js"   = "application/javascript; charset=utf-8"
    ".png"  = "image/png"
    ".jpg"  = "image/jpeg"
    ".jpeg" = "image/jpeg"
    ".gif"  = "image/gif"
    ".svg"  = "image/svg+xml"
    ".ico"  = "image/x-icon"
}

try {
    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response
        
        # Resolve request path
        $urlPath = $request.Url.LocalPath
        if ($urlPath -eq "" -or $urlPath -eq "/") {
            $urlPath = "/index.html"
        }
        
        # Translate to local path (decoding URLs like spaces)
        $decodedPath = [System.Uri]::UnescapeDataString($urlPath)
        # Normalize slashes
        $localRelative = $decodedPath.TrimStart('/').Replace('/', '\')
        $filePath = Join-Path $PSScriptRoot $localRelative
        
        if (Test-Path $filePath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($filePath).ToLower()
            $mimeType = $mimeTypeMapping[$ext]
            if ($null -eq $mimeType) {
                $mimeType = "application/octet-stream"
            }
            
            $response.ContentType = $mimeType
            # Enable CORS for testing
            $response.Headers.Add("Access-Control-Allow-Origin", "*")
            
            $bytes = [System.IO.File]::ReadAllBytes($filePath)
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "Served: $urlPath [200 OK]" -ForegroundColor Gray
        } else {
            $response.StatusCode = 404
            $response.ContentType = "text/plain"
            $bytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.ContentLength64 = $bytes.Length
            $response.OutputStream.Write($bytes, 0, $bytes.Length)
            Write-Host "Not Found: $urlPath [404]" -ForegroundColor Red
        }
        
        $response.Close()
    }
} catch [System.Management.Automation.PipelineStoppedException] {
    # Handled Ctrl+C stop
} finally {
    Write-Host "Stopping server..." -ForegroundColor Yellow
    $listener.Stop()
    $listener.Close()
    Write-Host "Server stopped." -ForegroundColor Red
}
